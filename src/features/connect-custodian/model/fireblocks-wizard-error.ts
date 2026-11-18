export type FireblocksWizardErrorCode =
  | "missing-api-key"
  | "missing-pem"
  | "invalid-pem"
  | "browser-blocked"
  | "http"
  | "invalid-response"
  | "incomplete-list"
  | "key-store"
  | "walletconnect-unconfigured"
  | "catalog-mismatch";

export class FireblocksWizardError extends Error {
  readonly code: FireblocksWizardErrorCode;
  readonly status: number | undefined;
  readonly detail: string | undefined;

  constructor(code: FireblocksWizardErrorCode, status?: number, detail?: string) {
    super(code);
    this.name = "FireblocksWizardError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}
