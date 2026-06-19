import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { QUICK_PERCENTAGE_OPTIONS } from "./create-transfer";
import { useConfidentialTransferSubmitHandler } from "./use-confidential-transfer-submit-handler";
import { useConfidentialTransfer } from "./use-confidential-transfer";
import { useTransferRecipientAndSubmitGates } from "./use-transfer-validation";
import { useRecipientRegistryStatus } from "./use-recipient-registry-status";
import { useTransferAssetModel } from "./use-transfer-asset-model";

export function useCreateTransfer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = useConfidentialTransfer();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);
  const {
    privateAddressStpl1: senderPrivateAddress,
    defaultNonce: senderNonce,
    actionsEnabled,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
  } = useWalletPrivateAddress();
  const { assets, tokenUi, amountInputs, selectedAsset } = useTransferAssetModel(
    senderPrivateAddress,
    assetIdFromUrl,
  );
  const recipientRegistryStatus = useRecipientRegistryStatus({
    recipient: amountInputs.recipient,
    walletPublicKey: publicKey,
  });
  const validation = useTransferRecipientAndSubmitGates({
    publicKey,
    senderPrivateAddress,
    recipient: amountInputs.recipient,
    selectedAsset,
    amount: amountInputs.amount,
    isSubmitting: isSubmitting || isPreparingWallet,
    actionsEnabled,
    recipientRegistryStatus,
  });
  const { submitError, handleSubmit } = useConfidentialTransferSubmitHandler({
    dispatch,
    canSubmit: validation.canSubmit,
    setIsSubmitting,
    setIsPreparingWallet,
    selectedAsset,
    submit,
    navigate,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    recipientTrim: validation.recipientTrim,
    numericAmount: validation.numericAmount,
  });
  const isActionPending = isSubmitting || isPreparingWallet;
  return {
    assets,
    showTokenPicker: tokenUi.showTokenPicker,
    setShowTokenPicker: tokenUi.setShowTokenPicker,
    showContactPicker: tokenUi.showContactPicker,
    setShowContactPicker: tokenUi.setShowContactPicker,
    selectedToken: selectedAsset,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    recipient: amountInputs.recipient,
    setRecipient: amountInputs.setRecipient,
    quickPercentageOptions: QUICK_PERCENTAGE_OPTIONS,
    handleTokenSelect: tokenUi.handleTokenSelect,
    handlePercentage: amountInputs.handlePercentage,
    handleMaxAmount: amountInputs.handleMaxAmount,
    totalAmount: validation.totalAmount,
    handleSubmit,
    canSubmit: validation.canSubmit,
    isSubmitting: isActionPending,
    submitError,
    recipientRegistryStatus,
    senderNonce,
    senderPrivateAddress,
    recipientValid: validation.recipientValid,
    recipientDiffersFromSender: validation.recipientDiffersFromSender,
    recipientErrorKey: validation.recipientErrorKey,
    publicKey,
  };
}
