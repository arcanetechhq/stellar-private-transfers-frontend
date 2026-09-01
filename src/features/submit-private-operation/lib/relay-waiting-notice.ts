import { isUnfinalizedRelayOperation } from "@/shared/lib/protocol-relay/is-unfinalized-relay-operation.js";

export function shouldShowRelayWaitingNotice(input: {
  isSubmitting: boolean;
  fallbackAllowed: boolean;
}): boolean {
  return input.isSubmitting && !input.fallbackAllowed;
}

export function hasPendingRelaySubmission(
  operations: Array<{ relayRequestId?: string; finalized: boolean }>,
): boolean {
  return operations.some((operation) => isUnfinalizedRelayOperation(operation));
}
