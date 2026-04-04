import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import {
  addCoin,
  findCommitmentLeafIndex,
  markCoinSpent,
  type CoinWithMetadata,
} from "@/entities/coin";
import {
  decimalFieldToBytes,
  getAuditPublicKey,
} from "@/features/deposit/lib/audit-encoding";
import { toAuditNumber } from "@/features/deposit/lib/to-audit-number";
import {
  fetchAndMergeMerkleState,
  readLeafEphemeralHex,
} from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { ZERO_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";
import { displayAmountToStroops, stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id";
import type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";
import {
  postPrivateWithdrawChangeDeliveryIfNeeded,
  signWithdrawDestinationStealthMessage,
} from "./private-withdrawal-sign-and-delivery";
import { runPrivateWithdrawalDualCoinMutation } from "./run-private-withdrawal-dual-mutation";

export type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";

async function loadSinglePrivateWithdrawMerkleContext(parameters: {
  poolContractRaw: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  pickedCoin: CoinWithMetadata;
  amountDisplay: number;
}): Promise<{
  poolContract: string;
  withdrawStroops: bigint;
  noteStroops: bigint;
  state: { commitments: string[] };
  ephemeral: Awaited<ReturnType<typeof readLeafEphemeralHex>>;
}> {
  const poolContract = normalizeSorobanContractId(parameters.poolContractRaw.trim());
  const withdrawStroops = displayAmountToStroops(parameters.amountDisplay);
  const noteStroops = BigInt(parameters.pickedCoin.coin.value);
  if (withdrawStroops > noteStroops) {
    throw new Error("Withdraw amount exceeds selected note value");
  }
  const { commitments } = await fetchAndMergeMerkleState({
    poolContractId: poolContract,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  const state = { commitments };
  const leafIndex = findCommitmentLeafIndex(commitments, parameters.pickedCoin);
  if (leafIndex < 0) {
    throw new Error("Coin commitment not found in on-chain Merkle state");
  }
  const ephemeral = await readLeafEphemeralHex({
    poolContractId: poolContract,
    walletPublicKey: parameters.walletPublicKey,
    leafIndex,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  return { poolContract, withdrawStroops, noteStroops, state, ephemeral };
}

async function sealSubmitAndApplySinglePrivateWithdrawEffects(parameters: {
  dispatch: RunPrivateWithdrawalMutationInput["dispatch"];
  prepared: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProof>>;
  withdrawStroops: bigint;
  changeStroops: bigint;
  pickedCoin: CoinWithMetadata;
  senderTrim: string;
  assetId: string;
  poolContract: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<RunPrivateWithdrawalMutationResult> {
  const auditPublicKey = getAuditPublicKey();
  const auditTx: ITransaction = {
    withdraw1: {
      value: toAuditNumber(parameters.withdrawStroops, "Withdraw amount"),
      secret: decimalFieldToBytes(parameters.pickedCoin.coin.secret),
      nullifier: decimalFieldToBytes(parameters.pickedCoin.coin.nullifier),
    },
  };
  if (parameters.prepared.changeCoin) {
    auditTx.deposit1 = {
      receiver: parameters.senderTrim,
      value: toAuditNumber(parameters.changeStroops, "Change amount"),
      secret: decimalFieldToBytes(parameters.prepared.changeCoin.coin.secret),
      nullifier: decimalFieldToBytes(parameters.prepared.changeCoin.coin.nullifier),
    };
  }
  const encoded = await sealAndEncryptTransaction(auditTx, auditPublicKey);
  const txId = await submitSorobanConfidentialTransfer({
    contractId: parameters.poolContract,
    walletPublicKey: parameters.walletPublicKey,
    proofHex: parameters.prepared.proof_hex,
    publicHex: parameters.prepared.public_hex,
    encoded,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  parameters.dispatch(markCoinSpent(parameters.pickedCoin.coin.commitment));
  const warnings: string[] = [];
  if (parameters.prepared.changeCoin) {
    const changeDisplay = stroopsToDisplayAmount(
      BigInt(parameters.prepared.changeCoin.coin.value),
    );
    parameters.dispatch(
      addCoin({
        commitmentHex: parameters.prepared.changeCoin.commitment_hex,
        coin: parameters.prepared.changeCoin.coin,
        depositScalarHex: parameters.prepared.changeCoin.depositScalarHex,
        stealthAddress: parameters.senderTrim,
        assetId: parameters.assetId,
        poolContract: parameters.poolContract,
        amountDisplay: changeDisplay,
        status: "pending",
        txId,
      }),
    );
    const deliveryWarning = await postPrivateWithdrawChangeDeliveryIfNeeded({
      dispatch: parameters.dispatch,
      changeCoin: parameters.prepared.changeCoin,
      senderTrim: parameters.senderTrim,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      txId,
    });
    if (deliveryWarning) {
      warnings.push(deliveryWarning);
    }
  }
  return {
    txId,
    coinDeliveryWarning:
      warnings.length > 0 ? warnings.join("; ") : undefined,
  };
}

async function runPrivateWithdrawalSingleCoinMutation(
  input: RunPrivateWithdrawalMutationInput,
  pickedCoin: CoinWithMetadata,
): Promise<RunPrivateWithdrawalMutationResult> {
  const senderTrim = input.senderStealthAddress.trim();
  const merkle = await loadSinglePrivateWithdrawMerkleContext({
    poolContractRaw: input.poolContractRaw,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
    pickedCoin,
    amountDisplay: input.amountDisplay,
  });
  const destinationTrim = input.destinationAddress.trim();
  const signedMessage = await signWithdrawDestinationStealthMessage(destinationTrim);
  const changeStroops = merkle.noteStroops - merkle.withdrawStroops;
  const changeStealth =
    changeStroops > ZERO_STROOPS ? senderTrim : undefined;
  const prepared = await privacyPoolService.prepareWithdrawTransactProof({
    coin: pickedCoin.coin,
    state: merkle.state,
    destinationStellarAddress: destinationTrim,
    withdrawSignMessageSignature: signedMessage,
    depositorEphemeralXHex: merkle.ephemeral.xHex,
    depositorEphemeralYHex: merkle.ephemeral.yHex,
    withdrawAmountStroops: merkle.withdrawStroops,
    changeStealthAddressStpl1: changeStealth,
  });
  return sealSubmitAndApplySinglePrivateWithdrawEffects({
    dispatch: input.dispatch,
    prepared,
    withdrawStroops: merkle.withdrawStroops,
    changeStroops,
    pickedCoin,
    senderTrim,
    assetId: input.assetId,
    poolContract: merkle.poolContract,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}

export async function runPrivateWithdrawalMutation(
  input: RunPrivateWithdrawalMutationInput,
): Promise<RunPrivateWithdrawalMutationResult> {
  if (input.pickedCoins.length === 1) {
    const only = input.pickedCoins[0];
    if (!only) {
      throw new Error("No coin selected for withdrawal");
    }
    return runPrivateWithdrawalSingleCoinMutation(input, only);
  }
  if (input.pickedCoins.length === 2) {
    return runPrivateWithdrawalDualCoinMutation(input);
  }
  throw new Error("Unsupported coin selection count for withdrawal");
}
