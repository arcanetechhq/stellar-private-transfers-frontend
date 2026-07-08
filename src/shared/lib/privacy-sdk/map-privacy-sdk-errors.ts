import type { PrivacySdkError } from "@arcanetech/privacy-sdk-core";
import { KytInspectError, parseKytReasonCode } from "@arcanetech/privacy-sdk-stellar/transact";
import { i18n } from "@/shared/config/i18n-instance.js";

export { KytInspectError, parseKytReasonCode } from "@arcanetech/privacy-sdk-stellar/transact";

const PENDING_CLAIM_ERROR_KEYS: Record<string, string> = {
  pending_claim_not_found: "pendingClaims:errors.claimNotFound",
  pending_claim_owner_mismatch: "pendingClaims:errors.claimOwnerMismatch",
  pending_claim_nullifier_spent: "pendingClaims:errors.claimAlreadySpent",
  pending_claim_missing_nullifier: "pendingClaims:errors.claimMissingNullifier",
  private_record_nullifier_spent: "transfer:errors.inputNoteAlreadySpent",
};

export function formatKytRejectionMessage(reasonCode: string): string {
  const parsed = parseKytReasonCode(reasonCode);
  const key = `reason_${parsed.code}`;
  const translated = i18n.t(key, {
    ns: "kyt",
    address: parsed.address ?? "",
    defaultValue: "",
  });
  if (translated) {
    return translated;
  }
  if (parsed.address) {
    return i18n.t("reasonDefault", { ns: "kyt" }) + ` (${parsed.address})`;
  }
  return i18n.t("reasonDefault", { ns: "kyt" });
}

export function formatKytRejectionTitle(): string {
  return i18n.t("inspectRejectedTitle", { ns: "kyt" });
}

function mapInsufficientStateReason(reason: string): string | undefined {
  const key = PENDING_CLAIM_ERROR_KEYS[reason];
  if (!key) {
    return undefined;
  }
  const translated = i18n.t(key, { defaultValue: "" });
  return translated || undefined;
}

function mapExecutionValidationReason(details: unknown): string | undefined {
  if (typeof details !== "object" || details === null || !("reason" in details)) {
    return undefined;
  }
  const reason = (details as { reason?: string }).reason;
  if (!reason) {
    return undefined;
  }
  return mapInsufficientStateReason(reason);
}

function mapPrivacySdkErrorMessage(error: PrivacySdkError): string {
  if (error.code === "insufficient_state") {
    const mapped = mapInsufficientStateReason(error.reason);
    if (mapped) {
      return mapped;
    }
  }
  if (error.code === "execution_error") {
    const mapped = mapExecutionValidationReason(error.details);
    if (mapped) {
      return mapped;
    }
  }
  return error.message;
}

export function mapPrivacySdkError(error: unknown): string {
  if (error instanceof KytInspectError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function mapPrivacySdkErrors(errors: PrivacySdkError[]): string {
  if (errors.length === 0) {
    return "Operation rejected";
  }
  return errors.map((error) => mapPrivacySdkErrorMessage(error)).join("; ");
}
