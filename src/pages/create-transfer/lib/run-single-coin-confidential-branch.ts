import type { OnboardingPayload } from "contract";
import type { CoinWithMetadata } from "@/entities/coin";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import { readLeafEphemeralHex } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { findCommitmentLeafIndex } from "@/entities/coin";
import { buildOnboardingPayload } from "@/shared/lib/registry/build-onboarding-payload";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { sealEncryptAndSubmitSingleCoinConfidentialTransfer } from "./single-coin-confidential-audit-submit";
import { finalizeConfidentialTransferDeliveries } from "./finalize-confidential-transfer-deliveries";

type PreparedSingleProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProof>
>;

interface SingleCoinBranchParameters {
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

async function submitSingleCoinTransfer(
  parameters: SingleCoinBranchParameters,
): Promise<{
  txId: string;
  recipientCoin: PreparedSingleProof["recipientCoin"];
  changeCoin: PreparedSingleProof["changeCoin"];
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
  const [only] = picked;
  const leafIndex = findCommitmentLeafIndex(commitments, only);
  if (leafIndex < 0) {
    throw new Error("Coin commitment not found in on-chain Merkle state");
  }
  const ephemeral = await readLeafEphemeralHex({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    leafIndex,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const prepared = await prepareConfidentialTransferProof({
    coin: only.coin,
    state,
    senderGAddress: input.walletPublicKey.trim(),
    senderPrivKeyScalarHex,
    depositorEphemeralXHex: ephemeral.xHex,
    depositorEphemeralYHex: ephemeral.yHex,
    transferStroops,
    recipientPrivateAddressStpl1: recipientTrim,
    selfPrivateAddressStpl1ForChange:
      transferStroops < BigInt(only.coin.value) ? senderTrim : undefined,
    tokenAddress: tokenContract,
  });
  let onboarding: OnboardingPayload | undefined;
  if (parameters.recipientTarget.temporaryKeyMaterial) {
    onboarding = buildOnboardingPayload({
      ownerStellarAddress: input.recipientStellarAddress,
      temporaryKey: parameters.recipientTarget.temporaryKeyMaterial,
      recipientNotes: [prepared.recipientCoin.coin],
    });
  }
  const txId = await sealEncryptAndSubmitSingleCoinConfidentialTransfer({
    prepared,
    only,
    input,
    poolContract,
    onboarding,
  });
  return {
    txId,
    recipientCoin: prepared.recipientCoin,
    changeCoin: prepared.changeCoin,
  };
}

interface FinalizeSingleParameters extends SingleCoinBranchParameters {
  txId: string;
  recipientCoin: PreparedSingleProof["recipientCoin"];
  changeCoin: PreparedSingleProof["changeCoin"];
}

async function finalizeSingleCoinDeliveries(
  parameters: FinalizeSingleParameters,
): Promise<string | undefined> {
  return finalizeConfidentialTransferDeliveries({
    ...parameters,
    suppressRecipientDelivery: Boolean(
      parameters.recipientTarget.temporaryKeyMaterial,
    ),
  });
}

export async function runSingleCoinConfidentialBranch(
  parameters: SingleCoinBranchParameters,
): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const submitted = await submitSingleCoinTransfer(parameters);
  const coinDeliveryWarning = await finalizeSingleCoinDeliveries({
    ...parameters,
    txId: submitted.txId,
    recipientCoin: submitted.recipientCoin,
    changeCoin: submitted.changeCoin,
  });
  return { txId: submitted.txId, coinDeliveryWarning };
}
