import type { OnboardingPayload } from "contract";
import { addCoin, markCoinSpent, type CoinWithMetadata } from "@/entities/coin";
import { buildCoinDeliveryPostBody } from "@/features/deposit";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import { readLeafEphemeralHex } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import { findCommitmentLeafIndex } from "@/entities/coin";
import { postCoinDeliveryBestEffort } from "@/entities/coin-deliveries";
import { buildOnboardingPayload } from "@/shared/lib/registry/build-onboarding-payload";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { sealEncryptAndSubmitSingleCoinConfidentialTransfer } from "./single-coin-confidential-audit-submit";

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
  const noteStroops = BigInt(only.coin.value);
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
    noteStroops,
    transferStroops,
    recipientTrim,
    senderTrim,
    input,
    poolContract,
    tokenContract,
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
  const {
    input,
    poolContract,
    recipientTrim,
    senderTrim,
    txId,
    recipientCoin,
    changeCoin,
    picked,
  } = parameters;
  for (const coinRow of picked) {
    input.dispatch(markCoinSpent(coinRow.coin.commitment));
  }
  if (changeCoin) {
    const changeDisplay = stroopsToDisplayAmount(BigInt(changeCoin.coin.value));
    input.dispatch(
      addCoin({
        commitmentHex: changeCoin.commitment_hex,
        coin: changeCoin.coin,
        depositScalarHex: changeCoin.depositScalarHex,
        precommitementHex: changeCoin.precommitementHex,
        privateAddress: senderTrim,
        assetId: input.assetId,
        poolContract,
        amountDisplay: changeDisplay,
        status: "pending",
        txId,
      }),
    );
  }
  const warnings: string[] = [];
  const suppressDeliveryWarnings = Boolean(
    parameters.recipientTarget.temporaryKeyMaterial,
  );
  if (!parameters.recipientTarget.temporaryKeyMaterial) {
    const warning = await postCoinDeliveryBestEffort(input.dispatch, () =>
      buildCoinDeliveryPostBody({
        recipientPrivateAddressStpl1: recipientTrim,
        commitmentHex: recipientCoin.commitment_hex,
        coin: recipientCoin.coin,
        depositScalarHex: recipientCoin.depositScalarHex,
        precommitementHex: recipientCoin.precommitementHex,
        assetId: input.assetId,
        amountDisplay: input.amountDisplay,
        txId,
      }),
    );
    if (warning) {
      warnings.push(warning);
    }
  }
  if (changeCoin) {
    const changeWarning = await postCoinDeliveryBestEffort(input.dispatch, () =>
      buildCoinDeliveryPostBody({
        recipientPrivateAddressStpl1: senderTrim,
        commitmentHex: changeCoin.commitment_hex,
        coin: changeCoin.coin,
        depositScalarHex: changeCoin.depositScalarHex,
        precommitementHex: changeCoin.precommitementHex,
        assetId: input.assetId,
        amountDisplay: stroopsToDisplayAmount(BigInt(changeCoin.coin.value)),
        txId,
      }),
    );
    if (changeWarning && !suppressDeliveryWarnings) {
      warnings.push(changeWarning);
    }
  }
  return warnings.length > 0 ? warnings.join("; ") : undefined;
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
