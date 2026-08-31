import type { ConfidentialTransferSuccess } from "./confidential-transfer-submit-flow";
import { useConfidentialTransferSubmitHandler } from "./use-confidential-transfer-submit-handler";
import { useTransferFormSlice } from "./use-transfer-form-slice";

export function useCreateTransferModel() {
  const form = useTransferFormSlice();
  const {
    submitError,
    setSubmitError,
    handleConfirmSend,
    relayAction,
    handleRetry,
    handleFallback,
  } = useConfidentialTransferSubmitHandler({
    dispatch: form.dispatch,
    canSubmit: form.validation.canSubmit,
    setIsSubmitting: form.setIsSubmitting,
    setIsPreparingWallet: form.setIsPreparingWallet,
    selectedAsset: form.selectedAsset,
    submit: form.submit,
    navigate: form.navigate,
    ensureWalletPrivateAddress: form.wallet.ensureWalletPrivateAddress,
    ensureWalletScalar: form.wallet.ensureWalletScalar,
    recipientTrim: form.validation.recipientTrim,
    numericAmount: form.validation.numericAmount,
    walletPublicKey: form.publicKey ?? "",
    onSuccess: (result: ConfidentialTransferSuccess) => {
      form.setSuccessResult(result);
      form.setStep("success");
    },
  });
  return {
    navigate: form.navigate,
    assets: form.assets,
    tokenUi: form.tokenUi,
    amountInputs: form.amountInputs,
    selectedAsset: form.selectedAsset,
    validation: form.validation,
    recipientRegistryStatus: form.recipientRegistryStatus,
    senderPrivateAddress: form.wallet.privateAddressStpl1,
    senderNonce: form.wallet.defaultNonce,
    publicKey: form.publicKey,
    step: form.step,
    successResult: form.successResult,
    submitError,
    setSubmitError,
    setStep: form.setStep,
    handleConfirmSend,
    handleRetry,
    handleFallback,
    relayAction,
    noteLimitAlert: form.noteLimitAlert,
    isActionPending: form.isSubmitting || form.isPreparingWallet,
  };
}
