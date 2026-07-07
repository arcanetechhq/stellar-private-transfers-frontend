import type { PrivateAddressPersistedShape } from "@/entities/private-address/model/types.js";
import {
  listWalletPrivateAddressRecordsForOwnerFromSdkBranch,
  listWalletPrivateAddressRecordsForOwnerFromSdkState,
  readWalletDefaultPrivateAddressNonceFromSdkState,
  readWalletDefaultPrivateAddressNonceFromSdkBranch,
  readWalletPrivateAddressRecordFromSdkState,
  readWalletPrivateAddressRecordFromSdkBranch,
} from "./wallet-private-address-sdk-state.js";
import {
  listWalletScalarsForOwnerFromSdkState,
  readWalletScalarHexFromSdkBranch,
} from "./wallet-scalar-sdk-state.js";

type PrivacySdkStateRoot = { privacySdkState?: unknown };

function ensureWalletObject(
  branch: Record<string, unknown>,
): Record<string, unknown> {
  const existing = branch.wallet;
  if (
    typeof existing === "object" &&
    existing !== null &&
    !Array.isArray(existing)
  ) {
    return existing as Record<string, unknown>;
  }
  const wallet: Record<string, unknown> = {};
  branch.wallet = wallet;
  return wallet;
}

function ensureRecordMap(
  wallet: Record<string, unknown>,
): Record<string, unknown> {
  const existing = wallet.privateAddressRecords;
  if (
    typeof existing === "object" &&
    existing !== null &&
    !Array.isArray(existing)
  ) {
    return existing as Record<string, unknown>;
  }
  const records: Record<string, unknown> = {};
  wallet.privateAddressRecords = records;
  return records;
}

function ensureDefaultNonceMap(
  wallet: Record<string, unknown>,
): Record<string, unknown> {
  const existing = wallet.defaultPrivateAddressNonce;
  if (
    typeof existing === "object" &&
    existing !== null &&
    !Array.isArray(existing)
  ) {
    return existing as Record<string, unknown>;
  }
  const defaults: Record<string, unknown> = {};
  wallet.defaultPrivateAddressNonce = defaults;
  return defaults;
}

function ensureScalarMap(
  wallet: Record<string, unknown>,
): Record<string, unknown> {
  const existing = wallet.privateAddressScalars;
  if (
    typeof existing === "object" &&
    existing !== null &&
    !Array.isArray(existing)
  ) {
    return existing as Record<string, unknown>;
  }
  const scalars: Record<string, unknown> = {};
  wallet.privateAddressScalars = scalars;
  return scalars;
}

function mergeLegacyNonceEntry(input: {
  owner: string;
  nonce: string;
  entry: PrivateAddressPersistedShape["byNonce"][string];
  records: Record<string, unknown>;
  scalars: Record<string, unknown>;
}): void {
  const trimmedNonce = input.nonce.trim();
  const trimmedAddress = input.entry.privateAddress.trim();
  if (!trimmedNonce || !trimmedAddress) {
    return;
  }
  const key = `${input.owner}:${trimmedNonce}`;
  if (!Object.hasOwn(input.records, key)) {
    input.records[key] = {
      owner: input.owner,
      nonce: trimmedNonce,
      privateAddress: trimmedAddress,
      createdAt: input.entry.createdAt,
    };
  }
  const legacyScalar = input.entry.recipientScalarHex?.trim();
  if (legacyScalar && !Object.hasOwn(input.scalars, key)) {
    input.scalars[key] = {
      owner: input.owner,
      nonce: trimmedNonce,
      scalarHex: legacyScalar,
    };
  }
}

export function mergeLegacyPrivateAddressIntoSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
  legacy: PrivateAddressPersistedShape | undefined;
}): Record<string, unknown> {
  const legacy = input.legacy;
  if (!legacy) {
    return input.branch;
  }
  const owner = input.owner.trim();
  if (!owner) {
    return input.branch;
  }
  const merged = structuredClone(input.branch);
  const wallet = ensureWalletObject(merged);
  const records = ensureRecordMap(wallet);
  const defaults = ensureDefaultNonceMap(wallet);
  const scalars = ensureScalarMap(wallet);
  for (const [nonce, entry] of Object.entries(legacy.byNonce)) {
    mergeLegacyNonceEntry({ owner, nonce, entry, records, scalars });
  }
  const defaultNonce = legacy.defaultNonce?.trim();
  if (defaultNonce && !Object.hasOwn(defaults, owner)) {
    defaults[owner] = defaultNonce;
  }
  return merged;
}

export function readWalletPrivateAddressViewFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string | undefined;
}): {
  byNonce: Record<string, { privateAddress: string; createdAt: number }>;
  defaultNonce: string | undefined;
  scalarByNonce: Record<string, string>;
} {
  const owner = input.owner?.trim();
  if (!owner) {
    return { byNonce: {}, defaultNonce: undefined, scalarByNonce: {} };
  }
  const byNonce: Record<string, { privateAddress: string; createdAt: number }> =
    {};
  for (const {
    nonce,
    entry,
  } of listWalletPrivateAddressRecordsForOwnerFromSdkBranch({
    branch: input.branch,
    owner,
  })) {
    byNonce[nonce] = entry;
  }
  const scalarByNonce: Record<string, string> = {};
  for (const nonce of Object.keys(byNonce)) {
    const scalarHex = readWalletScalarHexFromSdkBranch({
      branch: input.branch,
      owner,
      nonce,
    });
    if (scalarHex) {
      scalarByNonce[nonce] = scalarHex;
    }
  }
  return {
    byNonce,
    defaultNonce: readWalletDefaultPrivateAddressNonceFromSdkBranch({
      branch: input.branch,
      owner,
    }),
    scalarByNonce,
  };
}

export function readWalletPrivateAddressViewFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string | undefined;
}): {
  byNonce: Record<string, { privateAddress: string; createdAt: number }>;
  defaultNonce: string | undefined;
  scalarByNonce: Record<string, string>;
} {
  const owner = input.owner?.trim();
  if (!owner) {
    return { byNonce: {}, defaultNonce: undefined, scalarByNonce: {} };
  }
  const byNonce: Record<string, { privateAddress: string; createdAt: number }> =
    {};
  for (const {
    nonce,
    entry,
  } of listWalletPrivateAddressRecordsForOwnerFromSdkState({
    state: input.state,
    owner,
  })) {
    byNonce[nonce] = entry;
  }
  const scalarByNonce: Record<string, string> = {};
  for (const { nonce, scalarHex } of listWalletScalarsForOwnerFromSdkState({
    state: input.state,
    owner,
  })) {
    if (nonce in byNonce) {
      scalarByNonce[nonce] = scalarHex;
    }
  }
  return {
    byNonce,
    defaultNonce: readWalletDefaultPrivateAddressNonceFromSdkState({
      state: input.state,
      owner,
    }),
    scalarByNonce,
  };
}

export function readStoredPrivateAddressFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
  nonce: string;
}): string | undefined {
  return readWalletPrivateAddressRecordFromSdkState(
    input,
  )?.privateAddress.trim();
}
