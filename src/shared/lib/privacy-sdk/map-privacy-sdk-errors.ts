import {
  isPrivacySdkError,
  type PrivacySdkError,
} from "@arcanetech/privacy-sdk-core";
import {
  KytInspectError,
  parseKytReasonCode,
} from "@arcanetech/privacy-sdk-stellar/transact";
import { i18n } from "@/shared/config/i18n-instance.js";
import {
  isWalletAccountMismatchError,
  isWalletAccountMismatchMessage,
} from "@/shared/lib/wallet/wallet-account-mismatch-error";

export {
  KytInspectError,
  parseKytReasonCode,
} from "@arcanetech/privacy-sdk-stellar/transact";

const INSUFFICIENT_STATE_ERROR_KEYS: Record<string, string> = {
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

function formatWalletAccountMismatchMessage(): string {
  return i18n.t("walletAccountMismatch", {
    ns: "common",
    defaultValue: "Switch to the registered wallet address to continue.",
  });
}

function mapInsufficientStateReason(reason: string): string | undefined {
  const key = INSUFFICIENT_STATE_ERROR_KEYS[reason];
  if (!key) {
    return undefined;
  }
  const translated = i18n.t(key, { defaultValue: "" });
  return translated || undefined;
}

function mapExecutionValidationReason(details: unknown): string | undefined {
  if (
    typeof details !== "object" ||
    details === null ||
    !("reason" in details)
  ) {
    return undefined;
  }
  const reason = (details as { reason?: string }).reason;
  if (!reason) {
    return undefined;
  }
  return mapInsufficientStateReason(reason);
}

function fallbackPrivacySdkErrorMessage(error: PrivacySdkError): string {
  if (typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }
  if (error.details === undefined) {
    return `${error.code}: Operation failed`;
  }
  try {
    return JSON.stringify(error.details);
  } catch {
    return `${error.code}: Operation failed`;
  }
}

function mapPrivacySdkErrorMessage(error: PrivacySdkError): string {
  if (
    typeof error.message === "string" &&
    isWalletAccountMismatchMessage(error.message)
  ) {
    return formatWalletAccountMismatchMessage();
  }
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
  return fallbackPrivacySdkErrorMessage(error);
}

function readErrorLikeMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return undefined;
  }
  const message = (error as { message?: unknown }).message;
  if (typeof message !== "string") {
    return undefined;
  }
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isHtmlAsJsonParseError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("unexpected token") &&
    (normalized.includes("<!doctype") || normalized.includes("\"<\"") || normalized.includes("'<'"))
  );
}

function mapThrownErrorMessage(message: string): string {
  if (isWalletAccountMismatchMessage(message)) {
    return formatWalletAccountMismatchMessage();
  }
  if (isHtmlAsJsonParseError(message)) {
    return i18n.t("apiReturnedHtml", {
      ns: "kyt",
      defaultValue:
        "KYT inspect returned HTML instead of JSON. Check Network for kyt/passages/inspect (status and response body).",
    });
  }
  if (message.includes("KYT inspect returned HTML")) {
    return message;
  }
  return message;
}

export function mapPrivacySdkError(error: unknown): string {
  if (error instanceof KytInspectError) {
    return error.message;
  }
  if (isWalletAccountMismatchError(error)) {
    return formatWalletAccountMismatchMessage();
  }
  if (isPrivacySdkError(error)) {
    return mapPrivacySdkErrorMessage(error);
  }
  if (error instanceof Error) {
    return mapThrownErrorMessage(error.message);
  }
  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? mapThrownErrorMessage(trimmed) : "Operation failed";
  }
  const messageLike = readErrorLikeMessage(error);
  if (messageLike) {
    return mapThrownErrorMessage(messageLike);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Operation failed";
  }
}

export function mapPrivacySdkErrors(errors: PrivacySdkError[]): string {
  if (errors.length === 0) {
    return "Operation rejected";
  }
  return errors.map((error) => mapPrivacySdkErrorMessage(error)).join("; ");
}
