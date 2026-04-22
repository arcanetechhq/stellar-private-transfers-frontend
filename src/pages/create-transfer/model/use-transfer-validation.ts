import { useMemo } from "react";
import type { AssetWithTrustline } from "@/entities/asset";
import { isValidStealthAddressString } from "@/entities/stealth-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { NETWORK_FEE } from "./create-transfer";

function recipientFieldErrorKey(parameters: {
  recipientTrim: string;
  recipientValid: boolean;
  senderStealthAddress: string;
}): "invalidRecipient" | "sameAsSender" | undefined {
  if (!parameters.recipientTrim) {
    return undefined;
  }
  if (!parameters.recipientValid) {
    return "invalidRecipient";
  }
  if (parameters.recipientTrim === parameters.senderStealthAddress) {
    return "sameAsSender";
  }
  return undefined;
}

function transferIdentityAndRecipientReady(parameters: {
  publicKey: string | undefined;
  senderStealthAddress: string;
  recipientValid: boolean;
  recipientDiffersFromSender: boolean;
  selectedAsset: AssetWithTrustline | undefined;
  poolReady: boolean;
}): boolean {
  return (
    Boolean(parameters.publicKey?.trim()) &&
    parameters.senderStealthAddress.length > 0 &&
    parameters.recipientValid &&
    parameters.recipientDiffersFromSender &&
    parameters.selectedAsset !== undefined &&
    parameters.poolReady
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
  senderStealthAddress: string;
  recipientValid: boolean;
  recipientDiffersFromSender: boolean;
  selectedAsset: AssetWithTrustline | undefined;
  poolReady: boolean;
  amount: string;
  numericAmount: number;
  numericBalance: number;
  isSubmitting: boolean;
}): boolean {
  return (
    transferIdentityAndRecipientReady({
      publicKey: parameters.publicKey,
      senderStealthAddress: parameters.senderStealthAddress,
      recipientValid: parameters.recipientValid,
      recipientDiffersFromSender: parameters.recipientDiffersFromSender,
      selectedAsset: parameters.selectedAsset,
      poolReady: parameters.poolReady,
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
  senderStealthAddress: string;
  recipient: string;
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  isSubmitting: boolean;
}) {
  const numericBalance = parameters.selectedAsset
    ? Number.parseFloat(parameters.selectedAsset.balance ?? "0")
    : 0;
  const recipientTrim = parameters.recipient.trim();
  const recipientValid = isValidStealthAddressString(recipientTrim);
  const recipientDiffersFromSender =
    recipientTrim.length > 0 &&
    parameters.senderStealthAddress.length > 0 &&
    recipientTrim !== parameters.senderStealthAddress;
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
    senderStealthAddress: parameters.senderStealthAddress,
    recipientValid,
    recipientDiffersFromSender,
    selectedAsset: parameters.selectedAsset,
    poolReady,
    amount: parameters.amount,
    numericAmount,
    numericBalance,
    isSubmitting: parameters.isSubmitting,
  });

  const recipientErrorKey = useMemo(
    () =>
      recipientFieldErrorKey({
        recipientTrim,
        recipientValid,
        senderStealthAddress: parameters.senderStealthAddress,
      }),
    [recipientTrim, recipientValid, parameters.senderStealthAddress],
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
