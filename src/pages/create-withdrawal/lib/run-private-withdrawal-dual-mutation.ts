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
import { postPrivateWithdrawChangeDeliveryIfNeeded } from "./private-withdrawal-sign-and-delivery";

function buildDualPrivateWithdrawAuditTransaction(parameters: {
  first: CoinWithMetadata;
  second: CoinWithMetadata;
  noteA: bigint;
  noteB: bigint;
  changeStroops: bigint;
  senderTrim: string;
  preparedDual: Awaited<
    ReturnType<typeof privacyPoolService.prepareWithdrawTransactProofDual>
  >;
}): ITransaction {
  const auditTxDual: ITransaction = {
    withdraw1: {
      value: toAuditNumber(parameters.noteA, "Note value"),
      secret: decimalFieldToBytes(parameters.first.coin.secret),
      nullifier: decimalFieldToBytes(parameters.first.coin.nullifier),
    },
    withdraw2: {
      value: toAuditNumber(parameters.noteB, "Note value"),
      secret: decimalFieldToBytes(parameters.second.coin.secret),
      nullifier: decimalFieldToBytes(parameters.second.coin.nullifier),
    },
  };
  if (parameters.preparedDual.changeCoin) {
    auditTxDual.deposit1 = {
      receiver: parameters.senderTrim,
      value: toAuditNumber(parameters.changeStroops, "Change amount"),
      secret: decimalFieldToBytes(parameters.preparedDual.changeCoin.coin.secret),
      nullifier: decimalFieldToBytes(
        parameters.preparedDual.changeCoin.coin.nullifier,
      ),
    };
  }
  return auditTxDual;
}

async function applyDualPrivateWithdrawPostSubmitEffects(parameters: {
  dispatch: RunPrivateWithdrawalMutationInput["dispatch"];
  preparedDual: Awaited<
    ReturnType<typeof privacyPoolService.prepareWithdrawTransactProofDual>
  >;
  first: CoinWithMetadata;
  second: CoinWithMetadata;
  senderTrim: string;
  assetId: string;
  poolContract: string;
  txId: string;
}): Promise<string | undefined> {
  parameters.dispatch(markCoinSpent(parameters.first.coin.commitment));
  parameters.dispatch(markCoinSpent(parameters.second.coin.commitment));
  if (!parameters.preparedDual.changeCoin) {
    return undefined;
  }
  const changeDisplayDual = stroopsToDisplayAmount(
    BigInt(parameters.preparedDual.changeCoin.coin.value),
  );
  parameters.dispatch(
    addCoin({
      commitmentHex: parameters.preparedDual.changeCoin.commitment_hex,
      coin: parameters.preparedDual.changeCoin.coin,
      depositScalarHex: parameters.preparedDual.changeCoin.depositScalarHex,
      stealthAddress: parameters.senderTrim,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      amountDisplay: changeDisplayDual,
      status: "pending",
      txId: parameters.txId,
    }),
  );
  return postPrivateWithdrawChangeDeliveryIfNeeded({
    dispatch: parameters.dispatch,
    changeCoin: parameters.preparedDual.changeCoin,
    senderTrim: parameters.senderTrim,
    assetId: parameters.assetId,
    poolContract: parameters.poolContract,
    txId: parameters.txId,
  });
}

async function readDualWithdrawEphemerals(parameters: {
  poolContract: string;
  input: RunPrivateWithdrawalMutationInput;
  first: CoinWithMetadata;
  second: CoinWithMetadata;
  commitments: string[];
}): Promise<{
  ephemeralA: Awaited<ReturnType<typeof readLeafEphemeralHex>>;
  ephemeralB: Awaited<ReturnType<typeof readLeafEphemeralHex>>;
}> {
  const leafIndexA = findCommitmentLeafIndex(parameters.commitments, parameters.first);
  const leafIndexB = findCommitmentLeafIndex(parameters.commitments, parameters.second);
  if (leafIndexA < 0 || leafIndexB < 0) {
    throw new Error("Coin commitment not found in on-chain Merkle state");
  }
  const readArguments = {
    poolContractId: parameters.poolContract,
    walletPublicKey: parameters.input.walletPublicKey,
    networkPassphrase: parameters.input.networkPassphrase,
    sorobanRpcUrl: parameters.input.sorobanRpcUrl,
  };
  const ephemeralA = await readLeafEphemeralHex({
    ...readArguments,
    leafIndex: leafIndexA,
  });
  const ephemeralB = await readLeafEphemeralHex({
    ...readArguments,
    leafIndex: leafIndexB,
  });
  return { ephemeralA, ephemeralB };
}

async function buildDualPrivateWithdrawPreparedProof(parameters: {
  input: RunPrivateWithdrawalMutationInput;
  first: CoinWithMetadata;
  second: CoinWithMetadata;
}): Promise<{
  poolContract: string;
  senderTrim: string;
  noteA: bigint;
  noteB: bigint;
  changeStroops: bigint;
  preparedDual: Awaited<
    ReturnType<typeof privacyPoolService.prepareWithdrawTransactProofDual>
  >;
}> {
  const { input, first, second } = parameters;
  const senderTrim = input.senderStealthAddress.trim();
  const poolContract = normalizeSorobanContractId(input.poolContractRaw.trim());
  const withdrawStroops = displayAmountToStroops(input.amountDisplay);
  const noteA = BigInt(first.coin.value);
  const noteB = BigInt(second.coin.value);
  const totalNotes = noteA + noteB;
  if (withdrawStroops > totalNotes) {
    throw new Error("Withdraw amount exceeds combined note value");
  }
  const { commitments } = await fetchAndMergeMerkleState({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const state = { commitments };
  const { ephemeralA, ephemeralB } = await readDualWithdrawEphemerals({
    poolContract,
    input,
    first,
    second,
    commitments,
  });
  const destinationTrim = input.destinationAddress.trim();
  const changeStroops = totalNotes - withdrawStroops;
  const changeStealth =
    changeStroops > ZERO_STROOPS ? senderTrim : undefined;
  const preparedDual = await privacyPoolService.prepareWithdrawTransactProofDual({
    coinA: first.coin,
    coinB: second.coin,
    state,
    destinationStellarAddress: destinationTrim,
    privKeyScalarHex: input.senderPrivKeyScalarHex.trim(),
    depositorEphemeralAXHex: ephemeralA.xHex,
    depositorEphemeralAYHex: ephemeralA.yHex,
    depositorEphemeralBXHex: ephemeralB.xHex,
    depositorEphemeralBYHex: ephemeralB.yHex,
    withdrawAmountStroops: withdrawStroops,
    changeStealthAddressStpl1: changeStealth,
  });
  return {
    poolContract,
    senderTrim,
    noteA,
    noteB,
    changeStroops,
    preparedDual,
  };
}

export async function runPrivateWithdrawalDualCoinMutation(
  input: RunPrivateWithdrawalMutationInput,
): Promise<RunPrivateWithdrawalMutationResult> {
  const [first, second] = input.pickedCoins;
  if (!first || !second) {
    throw new Error("Dual withdrawal requires two coins");
  }
  const built = await buildDualPrivateWithdrawPreparedProof({
    input,
    first,
    second,
  });
  const auditTxDual = buildDualPrivateWithdrawAuditTransaction({
    first,
    second,
    noteA: built.noteA,
    noteB: built.noteB,
    changeStroops: built.changeStroops,
    senderTrim: built.senderTrim,
    preparedDual: built.preparedDual,
  });
  const auditPublicKey = getAuditPublicKey();
  const encodedDual = await sealAndEncryptTransaction(auditTxDual, auditPublicKey);
  const txId = await submitSorobanConfidentialTransfer({
    contractId: built.poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: built.preparedDual.proof_hex,
    publicHex: built.preparedDual.public_hex,
    encoded: encodedDual,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const changeWarn = await applyDualPrivateWithdrawPostSubmitEffects({
    dispatch: input.dispatch,
    preparedDual: built.preparedDual,
    first,
    second,
    senderTrim: built.senderTrim,
    assetId: input.assetId,
    poolContract: built.poolContract,
    txId,
  });
  return {
    txId,
    coinDeliveryWarning: changeWarn,
  };
}
