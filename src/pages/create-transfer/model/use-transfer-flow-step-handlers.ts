import { useNavigate } from "react-router";
import type { Dispatch, SetStateAction } from "react";

export type TransferFlowStep = "form" | "review" | "success";

export function useTransferFlowStepHandlers(parameters: {
  navigate: ReturnType<typeof useNavigate>;
  canSubmit: boolean;
  isActionPending: boolean;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  setStep: Dispatch<SetStateAction<TransferFlowStep>>;
}) {
  function handleOpenReview() {
    if (!parameters.canSubmit || parameters.isActionPending) {
      return;
    }
    parameters.setSubmitError(undefined);
    parameters.setStep("review");
  }

  function handleCloseReview() {
    if (parameters.isActionPending) {
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
