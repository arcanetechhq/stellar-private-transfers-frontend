import type { FireblocksWizardErrorCode } from "./fireblocks-wizard-error";
import { FireblocksWizardError } from "./fireblocks-wizard-error";

const WIZARD_ERROR_KEYS: Record<FireblocksWizardErrorCode, string> = {
  "missing-api-key": "errorMissingApiKey",
  "missing-pem": "errorMissingPem",
  "invalid-pem": "errorInvalidPem",
  "browser-blocked": "errorBrowserBlocked",
  http: "errorFireblocksStatus",
  "invalid-response": "errorInvalidResponse",
  "incomplete-list": "errorIncompleteList",
  "key-store": "errorKeyStore",
  "walletconnect-unconfigured": "errorWalletConnectNotConfigured",
  "catalog-mismatch": "errorCatalogMismatch",
};

const KEEP_PEM_CODES = new Set<FireblocksWizardErrorCode>([
  "missing-api-key",
  "missing-pem",
  "invalid-pem",
  "key-store",
]);

const STORED_KEY_CODES = new Set<FireblocksWizardErrorCode>([
  "browser-blocked",
  "http",
  "invalid-response",
  "incomplete-list",
]);

export type WizardTranslate = (
  key: string,
  options?: { status?: number; detail?: string },
) => string;

export function shouldClearPem(error: unknown): boolean {
  if (!(error instanceof FireblocksWizardError)) {
    return true;
  }
  return !KEEP_PEM_CODES.has(error.code);
}

export function signingKeyWasStored(error: unknown): boolean {
  if (!(error instanceof FireblocksWizardError)) {
    return true;
  }
  return STORED_KEY_CODES.has(error.code);
}

export function messageForWizardError(
  error: unknown,
  translate: WizardTranslate,
): string {
  if (!(error instanceof FireblocksWizardError)) {
    return translate("errorFireblocks");
  }
  if (error.code === "http" && error.detail) {
    return translate("errorFireblocksDetail", { detail: error.detail });
  }
  if (error.code === "http") {
    return translate(WIZARD_ERROR_KEYS.http, { status: error.status ?? 0 });
  }
  return translate(WIZARD_ERROR_KEYS[error.code]);
}
