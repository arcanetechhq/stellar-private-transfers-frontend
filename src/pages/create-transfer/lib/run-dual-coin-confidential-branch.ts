import type { OnboardingPayload } from "contract";
import { ZERO_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";
import { addCoin, markCoinSpent, type CoinWithMetadata } from "@/entities/coin";
import { buildCoinDeliveryPostBody } from "@/features/deposit";
import { prepareConfidentialTransferProofDual } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import { readLeafEphemeralHex } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import { findCommitmentLeafIndex } from "@/entities/coin";
import { postCoinDeliveryBestEffort } from "@/entities/coin-deliveries";
import { buildOnboardingPayload } from "@/shared/lib/registry/build-onboarding-payload";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { sealEncryptAndSubmitDualCoinConfidentialTransfer } from "./dual-coin-confidential-audit-submit";

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
  const noteA = BigInt(first.coin.value);
  const noteB = BigInt(second.coin.value);
  const onboarding = buildDualOnboardingPayload(parameters, preparedDual);
  const txId = await sealEncryptAndSubmitDualCoinConfidentialTransfer({
    preparedDual,
    first,
    second,
    noteA,
    noteB,
    transferStroops,
    changeStroopsDual,
    recipientTrim,
    senderTrim,
    input,
    poolContract,
    tokenContract,
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
    const changeDisplayDual = stroopsToDisplayAmount(
      BigInt(changeCoin.coin.value),
    );
    input.dispatch(
      addCoin({
        commitmentHex: changeCoin.commitment_hex,
        coin: changeCoin.coin,
        depositScalarHex: changeCoin.depositScalarHex,
        precommitementHex: changeCoin.precommitementHex,
        privateAddress: senderTrim,
        assetId: input.assetId,
        poolContract,
        amountDisplay: changeDisplayDual,
        status: "pending",
        txId,
      }),
    );
  }
  const warningsDual: string[] = [];
  const suppressDeliveryWarningsDual = Boolean(
    parameters.recipientTarget.temporaryKeyMaterial,
  );
  if (!parameters.recipientTarget.temporaryKeyMaterial) {
    const recipientWarning = await postCoinDeliveryBestEffort(input.dispatch, () =>
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
    if (recipientWarning) {
      warningsDual.push(recipientWarning);
    }
  }
  if (changeCoin) {
    const changeWarn = await postCoinDeliveryBestEffort(input.dispatch, () =>
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
    if (changeWarn && !suppressDeliveryWarningsDual) {
      warningsDual.push(changeWarn);
    }
  }
  return warningsDual.length > 0 ? warningsDual.join("; ") : undefined;
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
