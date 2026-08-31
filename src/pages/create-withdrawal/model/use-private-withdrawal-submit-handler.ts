import { useState } from "react";
import type { RelayActionState } from "@/shared/lib/protocol-relay";
import {
  confirmPrivateWithdrawal,
  type PrivateWithdrawalSubmitParameters,
} from "./confirm-private-withdrawal";
import { continuePrivateWithdrawal } from "./continue-private-withdrawal";

export function usePrivateWithdrawalSubmitHandler(
  parameters: PrivateWithdrawalSubmitParameters,
) {
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [relayAction, setRelayAction] = useState<RelayActionState>();
  const controls = { setSubmitError, setRelayAction };
  return {
    submitError,
    setSubmitError,
    relayAction,
    handleConfirmWithdraw: () =>
      void confirmPrivateWithdrawal({ parameters, controls }),
    handleRetry: () =>
      void continuePrivateWithdrawal({
        parameters,
        controls,
        relayAction,
        action: "retry",
      }),
    handleFallback: () =>
      void continuePrivateWithdrawal({
        parameters,
        controls,
        relayAction,
        action: "fallback",
      }),
  };
}
