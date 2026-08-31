import { i18n } from "@/shared/config/i18n-instance.js";
import { ProtocolRelayClientError } from "./protocol-relay-client-error.js";
import { PENDING_OPERATION_PHASE } from "./types.js";

const RELAY_OUTCOME_KEYS = {
  [PENDING_OPERATION_PHASE.rejected]: "rejected",
  [PENDING_OPERATION_PHASE.failed]: "failed",
  [PENDING_OPERATION_PHASE.admissionFailed]: "admissionFailed",
} as const;

function translateRelayReason(publicReason: string | undefined): string {
  if (!publicReason) {
    return "";
  }
  const translated = i18n.t(`reason_${publicReason}`, {
    ns: "relay",
    defaultValue: "",
  });
  return translated || publicReason;
}

function formatRelayOutcome(error: ProtocolRelayClientError): string | undefined {
  if (
    error.outcome !== PENDING_OPERATION_PHASE.rejected &&
    error.outcome !== PENDING_OPERATION_PHASE.failed &&
    error.outcome !== PENDING_OPERATION_PHASE.admissionFailed
  ) {
    return undefined;
  }
  const reason = translateRelayReason(error.publicReason) || error.outcome;
  return i18n.t(RELAY_OUTCOME_KEYS[error.outcome], { ns: "relay", reason });
}

export function formatProtocolRelayError(error: unknown): string {
  if (!(error instanceof ProtocolRelayClientError)) {
    return error instanceof Error ? error.message : "Operation failed";
  }
  return formatRelayOutcome(error) ?? error.message;
}
