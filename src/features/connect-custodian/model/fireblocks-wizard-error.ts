export type FireblocksWizardErrorCode =
  | "missing-api-key"
  | "missing-pem"
  | "invalid-pem"
  | "browser-blocked"
  | "http"
  | "invalid-response"
  | "incomplete-list"
  | "key-store";

export class FireblocksWizardError extends Error {
  readonly code: FireblocksWizardErrorCode;
  readonly status: number | undefined;

  constructor(code: FireblocksWizardErrorCode, status?: number) {
    super(code);
    this.name = "FireblocksWizardError";
    this.code = code;
    this.status = status;
  }
}
