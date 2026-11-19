import { lookupStellarAddresses } from "./fireblocks-asset-addresses";
import { callFireblocks } from "./fireblocks-request";
import { readPagingAfter } from "./fireblocks-paging";
import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";

const API_PREFIX = "/v1";
const ASSET_WALLETS_PATH = "/vault/asset_wallets";
const MAX_ASSET_WALLET_PAGES = 50;
const STELLAR_ADDRESS_PREFIX = "G";
const LIST_ADDRESS_FIELDS = [
  "address",
  "legacyAddress",
  "enterpriseAddress",
] as const;

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

type LookupRow = {
  kind: "lookup";
  vaultId: string;
  assetId: string;
  available: string;
};

type ParsedAssetWallet =
  | { kind: "ready"; wallet: StellarAssetWallet }
  | LookupRow
  | { kind: "skip" };

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
  return typeof value === "string" ? value.trim() : "";
}

function stellarAddressFrom(record: Record<string, unknown>): string {
  for (const field of LIST_ADDRESS_FIELDS) {
    const value = readStringField(record, field);
    if (value.startsWith(STELLAR_ADDRESS_PREFIX)) {
      return value;
    }
  }
  return "";
}

function hasListedAddress(record: Record<string, unknown>): boolean {
  return LIST_ADDRESS_FIELDS.some(
    (field) => readStringField(record, field).length > 0,
  );
}

function isStellarAssetId(assetId: string): boolean {
  return assetId === "XLM" || assetId.startsWith("XLM_");
}

function parseAssetWallet(value: unknown): ParsedAssetWallet {
  if (!isRecord(value)) {
    return { kind: "skip" };
  }
  const vaultId = readStringField(value, "vaultId");
  const assetId = readStringField(value, "assetId");
  const available = readStringField(value, "available");
  if (!isStellarAssetId(assetId)) {
    return { kind: "skip" };
  }
  const address = stellarAddressFrom(value);
  if (address.length > 0) {
    return {
      kind: "ready",
      wallet: { vaultId, assetId, address, available },
    };
  }
  if (hasListedAddress(value) || vaultId.length === 0 || assetId.length === 0) {
    return { kind: "skip" };
  }
  return { kind: "lookup", vaultId, assetId, available };
}

function readAssetWalletList(payload: unknown): unknown[] {
  if (!isRecord(payload) || !Array.isArray(payload.assetWallets)) {
    throw new FireblocksWizardError("invalid-response");
  }
  return payload.assetWallets;
}

async function appendStellarWallets(input: {
  target: StellarAssetWallet[];
  request: ListStellarAssetWalletsInput;
  payload: unknown;
}): Promise<void> {
  for (const record of readAssetWalletList(input.payload)) {
    const parsed = parseAssetWallet(record);
    if (parsed.kind === "ready") {
      input.target.push(parsed.wallet);
    } else if (parsed.kind === "lookup") {
      input.target.push(...(await lookupStellarAddresses(input.request, parsed)));
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
    await appendStellarWallets({ target: wallets, request: input, payload });
    const nextCursor = readPagingAfter(payload);
    if (nextCursor === undefined || nextCursor === cursor) {
      return wallets;
    }
    cursor = nextCursor;
  }
  throw new FireblocksWizardError("incomplete-list");
}
