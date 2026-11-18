import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";

const SESSION_PATH = "/api/custodian/wallet-connect";

export type ApproveWalletConnectInput = {
  vaultId: string;
  walletConnectUri: string;
};

function connectionId(payload: unknown): string {
  if (!isRecord(payload) || typeof payload.id !== "string") {
    throw new FireblocksWizardError("invalid-response");
  }
  const id = payload.id.trim();
  if (id.length === 0) {
    throw new FireblocksWizardError("invalid-response");
  }
  return id;
}

function errorDetail(payload: unknown): string | undefined {
  if (!isRecord(payload) || typeof payload.error !== "string") {
    return undefined;
  }
  const detail = payload.error.trim();
  return detail.length > 0 ? detail : undefined;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new FireblocksWizardError("invalid-response");
  }
}

export async function approveWalletConnectSession(
  input: ApproveWalletConnectInput,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(SESSION_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uri: input.walletConnectUri,
        vaultAccountId: input.vaultId,
      }),
    });
  } catch {
    throw new FireblocksWizardError("browser-blocked");
  }
  const payload = await readPayload(response);
  if (!response.ok) {
    const detail = errorDetail(payload);
    throw detail === undefined
      ? new FireblocksWizardError("http", response.status)
      : new FireblocksWizardError("http", response.status, detail);
  }
  connectionId(payload);
}
