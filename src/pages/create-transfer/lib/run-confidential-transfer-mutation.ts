import { fetchAndMergeMerkleState } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import {
  getRequiredPrivacyPoolContractId,
  getRequiredPrivateAddressRegistryContractId,
} from "@/shared/stellar/stellar-network-environment";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id";
import {
  generateTemporaryRecipientPrivateAddress,
  type TemporaryRecipientKeyMaterial,
} from "@/shared/lib/registry/build-onboarding-payload";
import { lookupRecipientPrivateAddress } from "@/shared/lib/registry/registry-lookup";
import type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";
import { pickPrivateSpendCoins } from "@/entities/coin";
import { runDualCoinConfidentialBranch } from "./run-dual-coin-confidential-branch";
import { runSingleCoinConfidentialBranch } from "./run-single-coin-confidential-branch";

export type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";

export type RecipientTransferTarget = {
  recipientPrivateAddressStpl1: string;
  temporaryKeyMaterial?: TemporaryRecipientKeyMaterial;
};

async function resolveRecipientTransferTarget(parameters: {
  recipientStellarAddress: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<RecipientTransferTarget> {
  const registryContractId = getRequiredPrivateAddressRegistryContractId();
  const lookup = await lookupRecipientPrivateAddress({
    registryContractId,
    recipientStellarAddress: parameters.recipientStellarAddress,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  if (lookup.status === "registered") {
    return { recipientPrivateAddressStpl1: lookup.privateAddressStpl1 };
  }
  const temporaryKeyMaterial = await generateTemporaryRecipientPrivateAddress();
  return {
    recipientPrivateAddressStpl1: temporaryKeyMaterial.temporaryPrivateAddressStpl1,
    temporaryKeyMaterial,
  };
}

export async function runConfidentialTransferMutation(
  input: RunConfidentialTransferInput,
): Promise<RunConfidentialTransferResult> {
  const poolContract = getRequiredPrivacyPoolContractId();
  const tokenContract = resolveTokenContractId(input.tokenContractRaw);
  const recipientStellarAddress = input.recipientStellarAddress.trim();
  const senderTrim = input.senderPrivateAddress.trim();
  const transferStroops = displayAmountToStroops(input.amountDisplay);
  const picked = pickPrivateSpendCoins({
    finalizedCoins: input.finalizedCoinsForSenderAndAsset,
    spendStroops: transferStroops,
    insufficientBalanceMessage: "Insufficient private balance for this transfer",
  });

  const { commitments } = await fetchAndMergeMerkleState({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const state = { commitments };

  const recipientTarget = await resolveRecipientTransferTarget({
    recipientStellarAddress,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const recipientTrim = recipientTarget.recipientPrivateAddressStpl1;

  const branchParameters = {
    input: {
      ...input,
      recipientStellarAddress,
      recipientPrivateAddressStpl1: recipientTrim,
    },
    poolContract,
    transferStroops,
    commitments,
    state,
    senderPrivKeyScalarHex: input.senderPrivKeyScalarHex.trim(),
    recipientTrim,
    senderTrim,
    tokenContract,
    picked,
    recipientTarget,
  };

  if (picked.length === 1) {
    return runSingleCoinConfidentialBranch(branchParameters);
  }
  if (picked.length === 2) {
    return runDualCoinConfidentialBranch(branchParameters);
  }
  throw new Error("Unsupported coin selection count");
}
