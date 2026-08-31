import { useState } from "react";
import type { RelayActionState } from "@/shared/lib/protocol-relay";
import {
  confirmConfidentialTransfer,
  type ConfidentialTransferSubmitParameters,
} from "./confirm-confidential-transfer";
import { continueConfidentialTransfer } from "./continue-confidential-transfer";

export type { ConfidentialTransferSubmit } from "./confirm-confidential-transfer";

export function useConfidentialTransferSubmitHandler(
  parameters: ConfidentialTransferSubmitParameters,
) {
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [relayAction, setRelayAction] = useState<RelayActionState>();
  const controls = { setSubmitError, setRelayAction };
  return {
    submitError,
    setSubmitError,
    relayAction,
    handleConfirmSend: () =>
      void confirmConfidentialTransfer({ parameters, controls }),
    handleRetry: () =>
      void continueConfidentialTransfer({
        parameters,
        controls,
        relayAction,
        action: "retry",
      }),
    handleFallback: () =>
      void continueConfidentialTransfer({
        parameters,
        controls,
        relayAction,
        action: "fallback",
      }),
  };
}
