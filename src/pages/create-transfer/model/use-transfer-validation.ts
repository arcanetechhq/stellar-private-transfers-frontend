import { useMemo } from "react";
import type { AssetWithTrustline } from "@/entities/asset";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import type { RecipientRegistryStatus } from "./use-recipient-registry-status";
import { parseTransferBalance } from "../lib/format-transfer-balance";
import { NETWORK_FEE } from "./create-transfer";

function recipientFieldErrorKey(parameters: {
  recipientTrim: string;
  recipientValid: boolean;
  walletPublicKey: string;
}): "invalidRecipient" | "sameAsSender" | undefined {
  if (!parameters.recipientTrim) {
    return undefined;
  }
  if (!parameters.recipientValid) {
    return "invalidRecipient";
  }
  if (parameters.recipientTrim === parameters.walletPublicKey) {
    return "sameAsSender";
  }
  return undefined;
}

function transferIdentityAndRecipientReady(parameters: {
  publicKey: string | undefined;
  senderPrivateAddress: string;
  recipientValid: boolean;
  recipientDiffersFromSender: boolean;
  selectedAsset: AssetWithTrustline | undefined;
  poolReady: boolean;
  actionsEnabled: boolean;
  recipientRegistryStatus: RecipientRegistryStatus;
}): boolean {
  const recipientLookupReady =
    parameters.recipientRegistryStatus !== "checking";
  return (
    Boolean(parameters.publicKey?.trim()) &&
    parameters.senderPrivateAddress.length > 0 &&
    parameters.recipientValid &&
    parameters.recipientDiffersFromSender &&
    parameters.selectedAsset !== undefined &&
    parameters.poolReady &&
    parameters.actionsEnabled &&
    recipientLookupReady
  );
}

function transferAmountWithinBalance(parameters: {
  amount: string;
  numericAmount: number;
  numericBalance: number;
}): boolean {
  return (
    parameters.amount !== "" &&
    !Number.isNaN(parameters.numericAmount) &&
    parameters.numericAmount > 0 &&
    parameters.numericAmount <= parameters.numericBalance
  );
}

function transferFormCanSubmit(parameters: {
  publicKey: string | undefined;
  senderPrivateAddress: string;
  recipientValid: boolean;
  recipientDiffersFromSender: boolean;
  selectedAsset: AssetWithTrustline | undefined;
  poolReady: boolean;
  amount: string;
  numericAmount: number;
  numericBalance: number;
  isSubmitting: boolean;
  actionsEnabled: boolean;
  recipientRegistryStatus: RecipientRegistryStatus;
}): boolean {
  return (
    transferIdentityAndRecipientReady({
      publicKey: parameters.publicKey,
      senderPrivateAddress: parameters.senderPrivateAddress,
      recipientValid: parameters.recipientValid,
      recipientDiffersFromSender: parameters.recipientDiffersFromSender,
      selectedAsset: parameters.selectedAsset,
      poolReady: parameters.poolReady,
      actionsEnabled: parameters.actionsEnabled,
      recipientRegistryStatus: parameters.recipientRegistryStatus,
    }) &&
    transferAmountWithinBalance({
      amount: parameters.amount,
      numericAmount: parameters.numericAmount,
      numericBalance: parameters.numericBalance,
    }) &&
    !parameters.isSubmitting
  );
}

export function useTransferRecipientAndSubmitGates(parameters: {
  publicKey: string | undefined;
  senderPrivateAddress: string;
  recipient: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  isSubmitting: boolean;
  actionsEnabled: boolean;
  recipientRegistryStatus: RecipientRegistryStatus;
}) {
  const numericBalance = parameters.selectedAsset
    ? parseTransferBalance(parameters.selectedAsset.balance)
    : 0;
  const recipientTrim = parameters.recipient.trim();
  const recipientValid = isValidStellarPublicAddress(recipientTrim);
  const walletPublicKey = parameters.publicKey?.trim() ?? "";
  const recipientDiffersFromSender =
    recipientTrim.length > 0 &&
    walletPublicKey.length > 0 &&
    recipientTrim !== walletPublicKey;
  const numericAmount = Number.parseFloat(parameters.amount);
  const poolReady = (() => {
    try {
      return Boolean(getRequiredPrivacyPoolContractId());
    } catch {
      return false;
    }
  })();
  const canSubmit = transferFormCanSubmit({
    publicKey: parameters.publicKey,
    senderPrivateAddress: parameters.senderPrivateAddress,
    recipientValid,
    recipientDiffersFromSender,
    selectedAsset: parameters.selectedAsset,
    poolReady,
    amount: parameters.amount,
    numericAmount,
    numericBalance,
    isSubmitting: parameters.isSubmitting,
    actionsEnabled: parameters.actionsEnabled,
    recipientRegistryStatus: parameters.recipientRegistryStatus,
  });

  const recipientErrorKey = useMemo(
    () =>
      recipientFieldErrorKey({
        recipientTrim,
        recipientValid,
        walletPublicKey,
      }),
    [recipientTrim, recipientValid, walletPublicKey],
  );

  const totalAmount = useMemo(() => {
    if (!parameters.amount || Number.isNaN(Number.parseFloat(parameters.amount))) {
      return NETWORK_FEE;
    }
    return Number.parseFloat(parameters.amount) + NETWORK_FEE;
  }, [parameters.amount]);

  return {
    recipientTrim,
    recipientValid,
    recipientDiffersFromSender,
    numericAmount,
    canSubmit,
    recipientErrorKey,
    totalAmount,
  };
}
