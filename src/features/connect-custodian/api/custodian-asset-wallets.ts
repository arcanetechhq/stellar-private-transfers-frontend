import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import type { FireblocksWizardErrorCode } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";
import type { StellarAssetWallet } from "../model/stellar-asset-wallet";

const WALLETS_PATH = "/api/custodian/asset-wallets";
const STELLAR_ADDRESS_PREFIX = "G";
const NAMED_FAILURES = new Set<FireblocksWizardErrorCode>([
  "missing-api-key",
  "missing-pem",
  "invalid-pem",
  "invalid-response",
  "incomplete-list",
  "key-store",
]);

export type CustodianAssetWalletRequest = {
  apiKey: string;
  privateKey: string;
};

function readText(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function readWallet(value: unknown): StellarAssetWallet | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const address = readText(value, "address");
  const vaultId = readText(value, "vaultId");
  const assetId = readText(value, "assetId");
  if (
    vaultId.length === 0 ||
    assetId.length === 0 ||
    !address.startsWith(STELLAR_ADDRESS_PREFIX)
  ) {
    return undefined;
  }
  return {
    vaultId,
    assetId,
    address,
    available: readText(value, "available"),
  };
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

function failureDetail(payload: unknown): string | undefined {
  if (!isRecord(payload) || typeof payload.error !== "string") {
    return undefined;
  }
  const detail = payload.error.trim();
  return detail.length > 0 ? detail : undefined;
}

function throwCustodianFailure(payload: unknown, status: number): never {
  const code =
    isRecord(payload) && typeof payload.code === "string" ? payload.code : "";
  const detail = failureDetail(payload);
  if (code === "http") {
    const reported =
      isRecord(payload) && typeof payload.status === "number"
        ? payload.status
        : status;
    throw new FireblocksWizardError("http", reported, detail);
  }
  if (NAMED_FAILURES.has(code as FireblocksWizardErrorCode)) {
    throw new FireblocksWizardError(code as FireblocksWizardErrorCode);
  }
  throw detail === undefined
    ? new FireblocksWizardError("http", status)
    : new FireblocksWizardError("http", status, detail);
}

function walletsFromPayload(payload: unknown): StellarAssetWallet[] {
  if (!isRecord(payload) || !Array.isArray(payload.wallets)) {
    throw new FireblocksWizardError("invalid-response");
  }
  const wallets: StellarAssetWallet[] = [];
  for (const record of payload.wallets) {
    const wallet = readWallet(record);
    if (wallet) {
      wallets.push(wallet);
    }
  }
  return wallets;
}

export async function listCustodianAssetWallets(
  input: CustodianAssetWalletRequest,
): Promise<StellarAssetWallet[]> {
  let response: Response;
  try {
    response = await fetch(WALLETS_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: input.apiKey,
        privateKey: input.privateKey,
      }),
    });
  } catch {
    throw new FireblocksWizardError("browser-blocked");
  }
  const payload = await readPayload(response);
  if (!response.ok) {
    throwCustodianFailure(payload, response.status);
  }
  return walletsFromPayload(payload);
}
