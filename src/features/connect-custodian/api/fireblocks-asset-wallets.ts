import { callFireblocks } from "./fireblocks-request";
import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";

const API_PREFIX = "/v1";
const ASSET_WALLETS_PATH = "/vault/asset_wallets";
const MAX_ASSET_WALLET_PAGES = 50;
const STELLAR_ADDRESS_PREFIX = "G";

export type StellarAssetWallet = {
  vaultId: string;
  assetId: string;
  address: string;
  available: string;
};

export type ListStellarAssetWalletsInput = {
  baseUrl: string;
  apiKey: string;
  signingKey: CryptoKey;
};

export function stellarWalletKey(wallet: StellarAssetWallet): string {
  return `${wallet.vaultId}:${wallet.assetId}:${wallet.address}`;
}

function assetWalletsUri(cursor: string | undefined): string {
  if (cursor === undefined || cursor.length === 0) {
    return `${API_PREFIX}${ASSET_WALLETS_PATH}`;
  }
  const query = new URLSearchParams({ after: cursor }).toString();
  return `${API_PREFIX}${ASSET_WALLETS_PATH}?${query}`;
}

function readStringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function toStellarWallet(value: unknown): StellarAssetWallet | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const address = readStringField(value, "address");
  if (!address.startsWith(STELLAR_ADDRESS_PREFIX)) {
    return undefined;
  }
  return {
    vaultId: readStringField(value, "vaultId"),
    assetId: readStringField(value, "assetId"),
    address,
    available: readStringField(value, "available"),
  };
}

function readAssetWalletList(payload: unknown): unknown[] {
  if (!isRecord(payload) || !Array.isArray(payload.assetWallets)) {
    throw new FireblocksWizardError("invalid-response");
  }
  return payload.assetWallets;
}

function readNextCursor(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.paging)) {
    return undefined;
  }
  const after = payload.paging.after;
  return typeof after === "string" && after.length > 0 ? after : undefined;
}

function appendStellarWallets(
  target: StellarAssetWallet[],
  payload: unknown,
): void {
  for (const record of readAssetWalletList(payload)) {
    const wallet = toStellarWallet(record);
    if (wallet) {
      target.push(wallet);
    }
  }
}

async function readAssetWalletPage(
  input: ListStellarAssetWalletsInput,
  cursor: string | undefined,
): Promise<unknown> {
  return callFireblocks({
    baseUrl: input.baseUrl,
    apiKey: input.apiKey,
    signingKey: input.signingKey,
    uriPath: assetWalletsUri(cursor),
  });
}

export async function listStellarAssetWallets(
  input: ListStellarAssetWalletsInput,
): Promise<StellarAssetWallet[]> {
  const wallets: StellarAssetWallet[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_ASSET_WALLET_PAGES; page += 1) {
    const payload = await readAssetWalletPage(input, cursor);
    appendStellarWallets(wallets, payload);
    const nextCursor = readNextCursor(payload);
    if (nextCursor === undefined || nextCursor === cursor) {
      return wallets;
    }
    cursor = nextCursor;
  }
  throw new FireblocksWizardError("incomplete-list");
}
