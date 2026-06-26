import { addCoin, findCommitmentLeafIndex, markCoinSpent, type CoinWithMetadata } from "@/entities/coin";
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
import type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";
import { postPrivateWithdrawChangeDeliveryIfNeeded } from "./private-withdrawal-sign-and-delivery";
async function applyDualPrivateWithdrawPostSubmitEffects(parameters: {
  dispatch: RunPrivateWithdrawalMutationInput["dispatch"];
  preparedDual: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProofDual>>;
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
      precommitementHex: parameters.preparedDual.changeCoin.precommitementHex,
      privateAddress: parameters.senderTrim,
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
}): Promise<{ ephemeralA: Awaited<ReturnType<typeof readLeafEphemeralHex>>; ephemeralB: Awaited<ReturnType<typeof readLeafEphemeralHex>> }> {
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
  tokenContract: string;
  senderTrim: string;
  preparedDual: Awaited<ReturnType<typeof privacyPoolService.prepareWithdrawTransactProofDual>>;
}> {
  const { input, first, second } = parameters;
  const senderTrim = input.senderPrivateAddress.trim();
  const poolContract = getRequiredPrivacyPoolContractId();
  const tokenContract = resolveTokenContractId(input.tokenContractRaw);
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
  const changePrivateAddress =
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
    changePrivateAddressStpl1: changePrivateAddress,
    tokenAddress: tokenContract,
  });
  return {
    poolContract,
    tokenContract,
    senderTrim,
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
  const txId = await submitSorobanConfidentialTransfer({
    contractId: built.poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: built.preparedDual.proof_hex,
    publicHex: built.preparedDual.public_hex,
    applicationIdsPlaintext: built.preparedDual.applicationIdsPlaintext,
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
