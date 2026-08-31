import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { AssetWithTrustline } from "@/entities/asset";
import type { PrivateWithdrawalSuccess } from "./private-withdrawal-success";
import { usePrivateWithdrawal } from "./use-private-withdrawal";
import { usePrivateWithdrawalSubmitHandler } from "./use-private-withdrawal-submit-handler";
import {
  useWithdrawalFlowStepHandlers,
  type WithdrawalFlowStep,
} from "./use-withdrawal-flow-step-handlers";

export function useWithdrawalConfirmSlice(input: {
  canSubmit: boolean;
  selectedAsset: AssetWithTrustline | undefined;
  senderPrivateAddress: string;
  destinationTrim: string;
  numericAmount: number;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submit } = usePrivateWithdrawal();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<WithdrawalFlowStep>("form");
  const [successResult, setSuccessResult] = useState<
    PrivateWithdrawalSuccess | undefined
  >();
  const {
    submitError,
    setSubmitError,
    handleConfirmWithdraw,
    relayAction,
    handleRetry,
    handleFallback,
  } = usePrivateWithdrawalSubmitHandler({
    dispatch,
    canSubmit: input.canSubmit,
    setIsSubmitting,
    selectedAsset: input.selectedAsset,
    submit,
    navigate,
    senderPrivateAddress: input.senderPrivateAddress,
    destinationTrim: input.destinationTrim,
    connectedPublicKey: publicKey?.trim() ?? "",
    numericAmount: input.numericAmount,
    onSuccess: (result) => {
      setSuccessResult(result);
      setStep("success");
    },
  });
  const { handleOpenReview, handleCloseReview, handleSuccessDone } =
    useWithdrawalFlowStepHandlers({
      navigate,
      canSubmit: input.canSubmit,
      isSubmitting,
      setSubmitError,
      setStep,
    });
  return {
    isSubmitting,
    step,
    successResult,
    submitError,
    relayAction,
    handleOpenReview,
    handleCloseReview,
    handleConfirmWithdraw,
    handleRetry,
    handleFallback,
    handleSuccessDone,
  };
}
