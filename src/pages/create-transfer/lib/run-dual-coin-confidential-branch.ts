import type { OnboardingPayload } from "contract";
import { ZERO_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";
import type { CoinWithMetadata } from "@/entities/coin";
import { prepareConfidentialTransferProofDual } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import { readLeafEphemeralHex } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { findCommitmentLeafIndex } from "@/entities/coin";
import { buildOnboardingPayload } from "@/shared/lib/registry/build-onboarding-payload";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { sealEncryptAndSubmitDualCoinConfidentialTransfer } from "./dual-coin-confidential-audit-submit";
import { finalizeConfidentialTransferDeliveries } from "./finalize-confidential-transfer-deliveries";

type PreparedDualProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProofDual>
>;

interface DualCoinBranchParameters {
  input: RunConfidentialTransferInput;
  poolContract: string;
  tokenContract: string;
  transferStroops: bigint;
  commitments: string[];
  state: { commitments: string[] };
  senderPrivKeyScalarHex: string;
  recipientTrim: string;
  senderTrim: string;
  picked: CoinWithMetadata[];
  recipientTarget: RecipientTransferTarget;
}

function buildDualOnboardingPayload(
  parameters: DualCoinBranchParameters,
  preparedDual: PreparedDualProof,
): OnboardingPayload | undefined {
  if (!parameters.recipientTarget.temporaryKeyMaterial) {
    return undefined;
  }
  return buildOnboardingPayload({
    ownerStellarAddress: parameters.input.recipientStellarAddress,
    temporaryKey: parameters.recipientTarget.temporaryKeyMaterial,
    recipientNotes: [preparedDual.recipientCoin.coin],
  });
}

async function submitDualCoinTransfer(
  parameters: DualCoinBranchParameters,
): Promise<{
  txId: string;
  recipientCoin: PreparedDualProof["recipientCoin"];
  changeCoin: PreparedDualProof["changeCoin"];
}> {
  const {
    input,
    poolContract,
    transferStroops,
    commitments,
    state,
    senderPrivKeyScalarHex,
    recipientTrim,
    senderTrim,
    tokenContract,
    picked,
  } = parameters;
  const [first, second] = picked;
  const leafIndexA = findCommitmentLeafIndex(commitments, first);
  const leafIndexB = findCommitmentLeafIndex(commitments, second);
  if (leafIndexA < 0 || leafIndexB < 0) {
    throw new Error("Coin commitment not found in on-chain Merkle state");
  }
  const ephemeralA = await readLeafEphemeralHex({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    leafIndex: leafIndexA,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const ephemeralB = await readLeafEphemeralHex({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    leafIndex: leafIndexB,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const totalNotes = BigInt(first.coin.value) + BigInt(second.coin.value);
  const changeStroopsDual = totalNotes - transferStroops;
  const preparedDual = await prepareConfidentialTransferProofDual({
    coinA: first.coin,
    coinB: second.coin,
    state,
    senderGAddress: input.walletPublicKey.trim(),
    senderPrivKeyScalarHex,
    ephemeralA: { xHex: ephemeralA.xHex, yHex: ephemeralA.yHex },
    ephemeralB: { xHex: ephemeralB.xHex, yHex: ephemeralB.yHex },
    transferStroops,
    recipientPrivateAddressStpl1: recipientTrim,
    selfPrivateAddressStpl1ForChange:
      changeStroopsDual > ZERO_STROOPS ? senderTrim : undefined,
    tokenAddress: tokenContract,
  });
  const onboarding = buildDualOnboardingPayload(parameters, preparedDual);
  const txId = await sealEncryptAndSubmitDualCoinConfidentialTransfer({
    preparedDual,
    input,
    poolContract,
    onboarding,
  });
  return {
    txId,
    recipientCoin: preparedDual.recipientCoin,
    changeCoin: preparedDual.changeCoin,
  };
}

interface FinalizeDualParameters extends DualCoinBranchParameters {
  txId: string;
  recipientCoin: PreparedDualProof["recipientCoin"];
  changeCoin: PreparedDualProof["changeCoin"];
}

async function finalizeDualCoinDeliveries(
  parameters: FinalizeDualParameters,
): Promise<string | undefined> {
  return finalizeConfidentialTransferDeliveries({
    ...parameters,
    suppressRecipientDelivery: Boolean(
      parameters.recipientTarget.temporaryKeyMaterial,
    ),
  });
}

export async function runDualCoinConfidentialBranch(
  parameters: DualCoinBranchParameters,
): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const submitted = await submitDualCoinTransfer(parameters);
  const coinDeliveryWarning = await finalizeDualCoinDeliveries({
    ...parameters,
    txId: submitted.txId,
    recipientCoin: submitted.recipientCoin,
    changeCoin: submitted.changeCoin,
  });
  return { txId: submitted.txId, coinDeliveryWarning };
}
