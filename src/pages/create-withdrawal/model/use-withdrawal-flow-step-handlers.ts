import { useNavigate } from "react-router";
import type { Dispatch, SetStateAction } from "react";

export type WithdrawalFlowStep = "form" | "review" | "success";

export function useWithdrawalFlowStepHandlers(parameters: {
  navigate: ReturnType<typeof useNavigate>;
  canSubmit: boolean;
  isSubmitting: boolean;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  setStep: Dispatch<SetStateAction<WithdrawalFlowStep>>;
}) {
  function handleOpenReview() {
    if (!parameters.canSubmit || parameters.isSubmitting) {
      return;
    }
    parameters.setSubmitError(undefined);
    parameters.setStep("review");
  }

  function handleCloseReview() {
    if (parameters.isSubmitting) {
      return;
    }
    parameters.setStep("form");
  }

  function handleSuccessDone() {
    parameters.navigate("/", { flushSync: true });
  }

  return {
    handleOpenReview,
    handleCloseReview,
    handleSuccessDone,
  };
}
