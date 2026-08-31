import { useCreateTransferModel } from "./use-create-transfer-model";
import { useTransferFlowStepHandlers } from "./use-transfer-flow-step-handlers";

export type { TransferFlowStep } from "./use-transfer-flow-step-handlers";

export function useCreateTransfer() {
  const model = useCreateTransferModel();
  const { handleOpenReview, handleCloseReview, handleSuccessDone } =
    useTransferFlowStepHandlers({
      navigate: model.navigate,
      canSubmit: model.validation.canSubmit,
      isActionPending: model.isActionPending,
      setSubmitError: model.setSubmitError,
      setStep: model.setStep,
    });

  return {
    assets: model.assets,
    selectedToken: model.selectedAsset,
    amount: model.amountInputs.amount,
    handleAmountChange: model.amountInputs.handleAmountChange,
    recipient: model.amountInputs.recipient,
    setRecipient: model.amountInputs.setRecipient,
    handleTokenSelect: model.tokenUi.handleTokenSelect,
    handleMaxAmount: model.amountInputs.handleMaxAmount,
    handlePercentage: model.amountInputs.handlePercentage,
    totalAmount: model.validation.totalAmount,
    canSubmit: model.validation.canSubmit,
    isSubmitting: model.isActionPending,
    submitError: model.submitError,
    noteLimitAlert: model.noteLimitAlert,
    recipientRegistryStatus: model.recipientRegistryStatus,
    senderNonce: model.senderNonce,
    senderPrivateAddress: model.senderPrivateAddress,
    recipientValid: model.validation.recipientValid,
    recipientDiffersFromSender: model.validation.recipientDiffersFromSender,
    recipientErrorKey: model.validation.recipientErrorKey,
    publicKey: model.publicKey,
    step: model.step,
    successResult: model.successResult,
    handleOpenReview,
    handleCloseReview,
    handleConfirmSend: model.handleConfirmSend,
    handleRetry: model.handleRetry,
    handleFallback: model.handleFallback,
    relayAction: model.relayAction,
    handleSuccessDone,
  };
}
