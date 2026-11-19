import { callFireblocks } from "./fireblocks-request";
import { readPagingAfter } from "./fireblocks-paging";
import { FireblocksWizardError } from "../model/fireblocks-wizard-error";
import { isRecord } from "../model/record-value";

type AddressLookupInput = {
  baseUrl: string;
  apiKey: string;
  signingKey: CryptoKey;
};

export type AssetAddressLookup = {
  vaultId: string;
  assetId: string;
  available: string;
};

type ResolvedStellarAddress = AssetAddressLookup & {
  address: string;
};

const API_PREFIX = "/v1";
const MAX_ADDRESS_PAGES = 50;
const STELLAR_ADDRESS_PREFIX = "G";

function addressesUri(
  row: AssetAddressLookup,
  cursor: string | undefined,
): string {
  const path = `${API_PREFIX}/vault/accounts/${encodeURIComponent(row.vaultId)}/${encodeURIComponent(row.assetId)}/addresses_paginated`;
  if (cursor === undefined || cursor.length === 0) {
    return path;
  }
  const query = new URLSearchParams({ after: cursor }).toString();
  return `${path}?${query}`;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function walletsFromAddressPage(
  row: AssetAddressLookup,
  payload: unknown,
): ResolvedStellarAddress[] {
  if (!isRecord(payload) || !Array.isArray(payload.addresses)) {
    return [];
  }
  const wallets: ResolvedStellarAddress[] = [];
  for (const record of payload.addresses) {
    if (!isRecord(record)) {
      continue;
    }
    const address = readString(record, "address");
    if (!address.startsWith(STELLAR_ADDRESS_PREFIX)) {
      continue;
    }
    wallets.push({
      vaultId: row.vaultId,
      assetId: row.assetId,
      address,
      available: row.available,
    });
  }
  return wallets;
}

export async function lookupStellarAddresses(
  input: AddressLookupInput,
  row: AssetAddressLookup,
): Promise<ResolvedStellarAddress[]> {
  const wallets: ResolvedStellarAddress[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_ADDRESS_PAGES; page += 1) {
    const payload = await callFireblocks({
      baseUrl: input.baseUrl,
      apiKey: input.apiKey,
      signingKey: input.signingKey,
      uriPath: addressesUri(row, cursor),
    });
    wallets.push(...walletsFromAddressPage(row, payload));
    const nextCursor = readPagingAfter(payload);
    if (nextCursor === undefined || nextCursor === cursor) {
      return wallets;
    }
    cursor = nextCursor;
  }
  throw new FireblocksWizardError("incomplete-list");
}
