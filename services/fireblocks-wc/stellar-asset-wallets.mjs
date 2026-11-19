const API_PREFIX = "/v1";
const ASSET_WALLETS_PATH = "/vault/asset_wallets";
const MAX_PAGES = 50;
const STELLAR_ADDRESS_PREFIX = "G";
const ADDRESS_FIELDS = ["address", "legacyAddress", "enterpriseAddress"];

function incompleteList() {
  return Object.assign(new Error("incomplete-list"), {
    status: 502,
    code: "incomplete-list",
  });
}

function readPagingAfter(payload) {
  const after = payload?.paging?.after;
  return typeof after === "string" && after.length > 0 ? after : undefined;
}

function readString(record, key) {
  const value = record?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function isStellarAssetId(assetId) {
  return assetId === "XLM" || assetId.startsWith("XLM_");
}

function stellarAddressFrom(record) {
  for (const field of ADDRESS_FIELDS) {
    const value = readString(record, field);
    if (value.startsWith(STELLAR_ADDRESS_PREFIX)) {
      return value;
    }
  }
  return "";
}

function hasListedAddress(record) {
  return ADDRESS_FIELDS.some((field) => readString(record, field).length > 0);
}

function assetWalletsUri(cursor) {
  if (cursor === undefined || cursor.length === 0) {
    return `${API_PREFIX}${ASSET_WALLETS_PATH}`;
  }
  const query = new URLSearchParams({ after: cursor }).toString();
  return `${API_PREFIX}${ASSET_WALLETS_PATH}?${query}`;
}

function addressesUri(row, cursor) {
  const path = `${API_PREFIX}/vault/accounts/${encodeURIComponent(row.vaultId)}/${encodeURIComponent(row.assetId)}/addresses_paginated`;
  if (cursor === undefined || cursor.length === 0) {
    return path;
  }
  const query = new URLSearchParams({ after: cursor }).toString();
  return `${path}?${query}`;
}

function parseAssetWallet(value) {
  if (!value || typeof value !== "object") {
    return { kind: "skip" };
  }
  const vaultId = readString(value, "vaultId");
  const assetId = readString(value, "assetId");
  const available = readString(value, "available");
  if (!isStellarAssetId(assetId)) {
    return { kind: "skip" };
  }
  const address = stellarAddressFrom(value);
  if (address.length > 0) {
    return { kind: "ready", wallet: { vaultId, assetId, address, available } };
  }
  if (hasListedAddress(value) || vaultId.length === 0 || assetId.length === 0) {
    return { kind: "skip" };
  }
  return { kind: "lookup", vaultId, assetId, available };
}

function walletsFromAddressPage(row, payload) {
  if (!payload || !Array.isArray(payload.addresses)) {
    return [];
  }
  const wallets = [];
  for (const record of payload.addresses) {
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

async function lookupStellarAddresses(call, row) {
  const wallets = [];
  let cursor;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const payload = await call(addressesUri(row, cursor));
    wallets.push(...walletsFromAddressPage(row, payload));
    const nextCursor = readPagingAfter(payload);
    if (nextCursor === undefined || nextCursor === cursor) {
      return wallets;
    }
    cursor = nextCursor;
  }
  throw incompleteList();
}

function readAssetWalletList(payload) {
  if (!payload || !Array.isArray(payload.assetWallets)) {
    throw Object.assign(new Error("invalid-response"), {
      status: 502,
      code: "invalid-response",
    });
  }
  return payload.assetWallets;
}

async function appendStellarWallets(target, payload, call) {
  for (const record of readAssetWalletList(payload)) {
    const parsed = parseAssetWallet(record);
    if (parsed.kind === "ready") {
      target.push(parsed.wallet);
    } else if (parsed.kind === "lookup") {
      target.push(...(await lookupStellarAddresses(call, parsed)));
    }
  }
}

export async function listStellarAssetWallets(call) {
  const wallets = [];
  let cursor;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const payload = await call(assetWalletsUri(cursor));
    await appendStellarWallets(wallets, payload, call);
    const nextCursor = readPagingAfter(payload);
    if (nextCursor === undefined || nextCursor === cursor) {
      return wallets;
    }
    cursor = nextCursor;
  }
  throw incompleteList();
}
