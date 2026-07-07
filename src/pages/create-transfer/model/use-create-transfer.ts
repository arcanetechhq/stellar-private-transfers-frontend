import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import type { ConfidentialTransferSuccess } from "./confidential-transfer-submit-flow";
import { useConfidentialTransferSubmitHandler } from "./use-confidential-transfer-submit-handler";
import { useConfidentialTransfer } from "./use-confidential-transfer";
import { useTransferRecipientAndSubmitGates } from "./use-transfer-validation";
import { useRecipientRegistryStatus } from "./use-recipient-registry-status";
import { useTransferAssetModel } from "./use-transfer-asset-model";

export type TransferFlowStep = "form" | "review" | "success";

export function useCreateTransfer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = useConfidentialTransfer();
  const [searchParameters] = useSearchParams();
  const assetIdFromUrl = searchParameters.get("assetId");
  const recipientFromUrl = searchParameters.get("recipient") ?? "";
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);
  const [step, setStep] = useState<TransferFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    ConfidentialTransferSuccess | undefined
  >();
  const {
    privateAddressStpl1: senderPrivateAddress,
    defaultNonce: senderNonce,
    actionsEnabled,
    ensureWalletPrivateAddress,
  } = useWalletPrivateAddress();
  const { assets, tokenUi, amountInputs, selectedAsset } = useTransferAssetModel(
    senderPrivateAddress,
    assetIdFromUrl,
    recipientFromUrl,
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
  const { submitError, setSubmitError, handleConfirmSend } =
    useConfidentialTransferSubmitHandler({
      dispatch,
      canSubmit: validation.canSubmit,
      setIsSubmitting,
      setIsPreparingWallet,
      selectedAsset,
      submit,
      navigate,
      ensureWalletPrivateAddress,
      recipientTrim: validation.recipientTrim,
      numericAmount: validation.numericAmount,
      onSuccess: (result) => {
        setSuccessResult(result);
        setStep("success");
      },
    });
  const isActionPending = isSubmitting || isPreparingWallet;

  function handleOpenReview() {
    if (!validation.canSubmit || isActionPending) {
      return;
    }
    setSubmitError(undefined);
    setStep("review");
  }

  function handleCloseReview() {
    if (isActionPending) {
      return;
    }
    setStep("form");
  }

  function handleSuccessDone() {
    navigate("/", { flushSync: true });
  }

  return {
    assets,
    selectedToken: selectedAsset,
    amount: amountInputs.amount,
    handleAmountChange: amountInputs.handleAmountChange,
    recipient: amountInputs.recipient,
    setRecipient: amountInputs.setRecipient,
    handleTokenSelect: tokenUi.handleTokenSelect,
    handleMaxAmount: amountInputs.handleMaxAmount,
    handlePercentage: amountInputs.handlePercentage,
    totalAmount: validation.totalAmount,
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
    step,
    successResult,
    handleOpenReview,
    handleCloseReview,
    handleConfirmSend,
    handleSuccessDone,
  };
}
