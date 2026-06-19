import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import {
  addCoin,
  findCommitmentLeafIndex,
  markCoinSpent,
  type CoinWithMetadata,
} from "@/entities/coin";
import {
  getAuditPublicKey,
  toAuditNumber,
} from "@/features/deposit";
import {
  fetchAndMergeMerkleState,
  readLeafEphemeralHex,
} from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { ZERO_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";
import { displayAmountToStroops, stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id";
import {
  buildAuditDepositLeg,
  buildAuditWithdrawLeg,
} from "@/shared/lib/audit/build-audit-transaction-leg";
import { resolveAuditPrecommitementHex } from "@/shared/lib/audit/resolve-audit-precommitement-hex";
import type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";
import { postPrivateWithdrawChangeDeliveryIfNeeded } from "./private-withdrawal-sign-and-delivery";
import { runPrivateWithdrawalDualCoinMutation } from "./run-private-withdrawal-dual-mutation";

export type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";

async function loadSinglePrivateWithdrawMerkleContext(parameters: {
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
  const poolContract = getRequiredPrivacyPoolContractId();
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

function buildSinglePrivateWithdrawAuditTransaction(parameters: {
  withdrawStroops: bigint;
  pickedCoin: CoinWithMetadata;
  senderTrim: string;
  tokenContract: string;
  changeStroops: bigint;
  prepared: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProof>>;
}): ITransaction {
  const base = {
    withdraw1: buildAuditWithdrawLeg({
      value: toAuditNumber(parameters.withdrawStroops, "Withdraw amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.pickedCoin.precommitementHex,
        "withdraw1",
      ),
      nullifierDecimal: parameters.pickedCoin.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
  };
  if (!parameters.prepared.changeCoin) {
    return base as unknown as ITransaction;
  }
  return {
    ...base,
    deposit1: buildAuditDepositLeg(parameters.senderTrim, {
      value: toAuditNumber(parameters.changeStroops, "Change amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.prepared.changeCoin.precommitementHex,
        "deposit1",
      ),
      nullifierDecimal: parameters.prepared.changeCoin.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
  } as unknown as ITransaction;
}

async function applySingleWithdrawChangeEffects(parameters: {
  prepared: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProof>>;
  dispatch: RunPrivateWithdrawalMutationInput["dispatch"];
  senderTrim: string;
  assetId: string;
  poolContract: string;
  txId: string;
}): Promise<string | undefined> {
  if (!parameters.prepared.changeCoin) {
    return undefined;
  }
  const changeDisplay = stroopsToDisplayAmount(
    BigInt(parameters.prepared.changeCoin.coin.value),
  );
  parameters.dispatch(
    addCoin({
      commitmentHex: parameters.prepared.changeCoin.commitment_hex,
      coin: parameters.prepared.changeCoin.coin,
      depositScalarHex: parameters.prepared.changeCoin.depositScalarHex,
      precommitementHex: parameters.prepared.changeCoin.precommitementHex,
      privateAddress: parameters.senderTrim,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      amountDisplay: changeDisplay,
      status: "pending",
      txId: parameters.txId,
    }),
  );
  return postPrivateWithdrawChangeDeliveryIfNeeded({
    dispatch: parameters.dispatch,
    changeCoin: parameters.prepared.changeCoin,
    senderTrim: parameters.senderTrim,
    assetId: parameters.assetId,
    poolContract: parameters.poolContract,
    txId: parameters.txId,
  });
}

async function sealSubmitAndApplySinglePrivateWithdrawEffects(parameters: {
  dispatch: RunPrivateWithdrawalMutationInput["dispatch"];
  prepared: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProof>>;
  withdrawStroops: bigint;
  changeStroops: bigint;
  pickedCoin: CoinWithMetadata;
  senderTrim: string;
  assetId: string;
  tokenContract: string;
  poolContract: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<RunPrivateWithdrawalMutationResult> {
  const auditTx = buildSinglePrivateWithdrawAuditTransaction(parameters);
  const encoded = await sealAndEncryptTransaction(auditTx, getAuditPublicKey());
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
  const deliveryWarning = await applySingleWithdrawChangeEffects({
    prepared: parameters.prepared,
    dispatch: parameters.dispatch,
    senderTrim: parameters.senderTrim,
    assetId: parameters.assetId,
    poolContract: parameters.poolContract,
    txId,
  });
  return {
    txId,
    coinDeliveryWarning: deliveryWarning,
  };
}

async function runPrivateWithdrawalSingleCoinMutation(
  input: RunPrivateWithdrawalMutationInput,
  pickedCoin: CoinWithMetadata,
): Promise<RunPrivateWithdrawalMutationResult> {
  const senderTrim = input.senderPrivateAddress.trim();
  const tokenContract = resolveTokenContractId(input.tokenContractRaw);
  const merkle = await loadSinglePrivateWithdrawMerkleContext({
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
    pickedCoin,
    amountDisplay: input.amountDisplay,
  });
  const destinationTrim = input.destinationAddress.trim();
  const changeStroops = merkle.noteStroops - merkle.withdrawStroops;
  const changePrivateAddress =
    changeStroops > ZERO_STROOPS ? senderTrim : undefined;
  const prepared = await privacyPoolService.prepareWithdrawTransactProof({
    coin: pickedCoin.coin,
    state: merkle.state,
    destinationStellarAddress: destinationTrim,
    privKeyScalarHex: input.senderPrivKeyScalarHex.trim(),
    depositorEphemeralXHex: merkle.ephemeral.xHex,
    depositorEphemeralYHex: merkle.ephemeral.yHex,
    withdrawAmountStroops: merkle.withdrawStroops,
    changePrivateAddressStpl1: changePrivateAddress,
    tokenAddress: tokenContract,
  });
  return sealSubmitAndApplySinglePrivateWithdrawEffects({
    dispatch: input.dispatch,
    prepared,
    withdrawStroops: merkle.withdrawStroops,
    changeStroops,
    pickedCoin,
    senderTrim,
    assetId: input.assetId,
    tokenContract,
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
