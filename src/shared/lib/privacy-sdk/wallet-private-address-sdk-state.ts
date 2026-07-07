import type { PrivateAddressNonceEntry } from "@/entities/private-address/model/types.js";
import * as StellarPrivacySdk from "@arcane/privacy-sdk-stellar";
import { getPrivacySdkClientOrThrow } from "./transact-context.js";

type PrivacySdkStateRoot = { privacySdkState?: unknown };
type WalletRecordSnapshot = {
  owner: string;
  nonce: string;
  privateAddress: string;
  createdAt: number;
};
type WalletScalarSnapshot = { owner: string; nonce: string; scalarHex: string };
type ReadRecordFromSnapshot = (input: {
  state: unknown;
  owner: string;
  nonce: string;
}) => WalletRecordSnapshot | undefined;
type ReadDefaultNonceFromSnapshot = (input: {
  state: unknown;
  owner: string;
}) => string | undefined;
type ListRecordsForOwnerFromSnapshot = (input: {
  state: unknown;
  owner: string;
}) => WalletRecordSnapshot[];
type ListScalarsForOwnerFromSnapshot = (input: {
  state: unknown;
  owner: string;
}) => WalletScalarSnapshot[];

const readWalletPrivateAddressRecordFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    readWalletPrivateAddressRecordFromStateSnapshot?: ReadRecordFromSnapshot;
  }
).readWalletPrivateAddressRecordFromStateSnapshot;

const readWalletDefaultPrivateAddressNonceFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    readWalletDefaultPrivateAddressNonceFromStateSnapshot?: ReadDefaultNonceFromSnapshot;
  }
).readWalletDefaultPrivateAddressNonceFromStateSnapshot;

const listWalletPrivateAddressRecordsForOwnerFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    listWalletPrivateAddressRecordsForOwnerFromStateSnapshot?: ListRecordsForOwnerFromSnapshot;
  }
).listWalletPrivateAddressRecordsForOwnerFromStateSnapshot;

const listWalletPrivateAddressScalarsForOwnerFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    listWalletPrivateAddressScalarsForOwnerFromStateSnapshot?: ListScalarsForOwnerFromSnapshot;
  }
).listWalletPrivateAddressScalarsForOwnerFromStateSnapshot;

function readWalletBranch(
  branch: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const wallet = branch.wallet;
  if (typeof wallet !== "object" || wallet === null || Array.isArray(wallet)) {
    return undefined;
  }
  return wallet as Record<string, unknown>;
}

function readWalletRecords(
  branch: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const wallet = readWalletBranch(branch);
  if (!wallet) {
    return undefined;
  }
  const records = wallet.privateAddressRecords;
  if (typeof records !== "object" || records === null || Array.isArray(records)) {
    return undefined;
  }
  return records as Record<string, unknown>;
}

function readRecordEntry(entry: unknown): PrivateAddressNonceEntry | undefined {
  if (typeof entry !== "object" || entry === null) {
    return undefined;
  }
  const record = entry as Record<string, unknown>;
  const privateAddress = record.privateAddress;
  const createdAt = record.createdAt;
  if (typeof privateAddress !== "string" || typeof createdAt !== "number") {
    return undefined;
  }
  const trimmedAddress = privateAddress.trim();
  if (!trimmedAddress) {
    return undefined;
  }
  return { privateAddress: trimmedAddress, createdAt };
}

export function readWalletPrivateAddressRecordFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
  nonce: string;
}): PrivateAddressNonceEntry | undefined {
  const records = readWalletRecords(input.branch);
  if (!records) {
    return undefined;
  }
  const key = `${input.owner.trim()}:${input.nonce.trim()}`;
  return readRecordEntry(records[key]);
}

export function readWalletPrivateAddressRecordFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
  nonce: string;
}): PrivateAddressNonceEntry | undefined {
  const record = readWalletPrivateAddressRecordFromStateSnapshot?.(input);
  return record
    ? {
        privateAddress: record.privateAddress.trim(),
        createdAt: record.createdAt,
      }
    : undefined;
}

export function readWalletDefaultPrivateAddressNonceFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
}): string | undefined {
  const wallet = readWalletBranch(input.branch);
  if (!wallet) {
    return undefined;
  }
  const defaults = wallet.defaultPrivateAddressNonce;
  if (typeof defaults !== "object" || defaults === null || Array.isArray(defaults)) {
    return undefined;
  }
  const value = (defaults as Record<string, unknown>)[input.owner.trim()];
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

export function readWalletDefaultPrivateAddressNonceFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
}): string | undefined {
  return readWalletDefaultPrivateAddressNonceFromStateSnapshot?.(input);
}

export function listWalletPrivateAddressRecordsForOwnerFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
}): Array<{ nonce: string; entry: PrivateAddressNonceEntry }> {
  const trimmedOwner = input.owner.trim();
  if (!trimmedOwner) {
    return [];
  }
  const records = readWalletRecords(input.branch);
  if (!records) {
    return [];
  }
  const prefix = `${trimmedOwner}:`;
  const results: Array<{ nonce: string; entry: PrivateAddressNonceEntry }> = [];
  for (const key of Object.keys(records)) {
    if (!key.startsWith(prefix)) {
      continue;
    }
    const nonce = key.slice(prefix.length).trim();
    const entry = readRecordEntry(records[key]);
    if (nonce && entry) {
      results.push({ nonce, entry });
    }
  }
  return results;
}

export function listWalletPrivateAddressRecordsForOwnerFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
}): Array<{ nonce: string; entry: PrivateAddressNonceEntry }> {
  return (listWalletPrivateAddressRecordsForOwnerFromStateSnapshot?.(input) ?? [])
    .map((record) => ({
      nonce: record.nonce.trim(),
      entry: {
        privateAddress: record.privateAddress.trim(),
        createdAt: record.createdAt,
      },
    }))
    .filter((item) => Boolean(item.nonce && item.entry.privateAddress));
}

export async function saveWalletPrivateAddressRecordToSdkState(input: {
  owner: string;
  nonce: string;
  privateAddress: string;
  createdAt: number;
}): Promise<void> {
  const owner = input.owner.trim();
  const nonce = input.nonce.trim();
  const privateAddress = input.privateAddress.trim();
  if (!owner || !nonce || !privateAddress) {
    return;
  }
  await getPrivacySdkClientOrThrow().saveWalletPrivateAddressRecord({
    owner,
    nonce,
    privateAddress,
    createdAt: input.createdAt,
  });
}

async function writeOwnerNonceOperation(input: {
  owner: string;
  nonce: string;
  type: "setWalletDefaultPrivateAddressNonce" | "deleteWalletPrivateAddressScalar";
}): Promise<void> {
  const owner = input.owner.trim();
  const nonce = input.nonce.trim();
  if (!owner || !nonce) {
    return;
  }
  const client = getPrivacySdkClientOrThrow();
  if (input.type === "setWalletDefaultPrivateAddressNonce") {
    await client.setWalletDefaultPrivateAddressNonce({ owner, nonce });
    return;
  }
  await client.deleteWalletPrivateAddressScalar({ owner, nonce });
}

export async function setWalletDefaultPrivateAddressNonceToSdkState(input: {
  owner: string;
  nonce: string;
}): Promise<void> {
  await writeOwnerNonceOperation({
    ...input,
    type: "setWalletDefaultPrivateAddressNonce",
  });
}

export async function deleteWalletPrivateAddressScalarFromSdkState(input: {
  owner: string;
  nonce: string;
}): Promise<void> {
  await writeOwnerNonceOperation({
    ...input,
    type: "deleteWalletPrivateAddressScalar",
  });
}

export async function clearWalletPrivateAddressScalarsForOwner(
  state: PrivacySdkStateRoot,
  owner: string,
): Promise<void> {
  const trimmedOwner = owner.trim();
  if (!trimmedOwner) {
    return;
  }
  const nonces = (
    listWalletPrivateAddressScalarsForOwnerFromStateSnapshot?.({
      state,
      owner: trimmedOwner,
    }) ?? []
  )
    .map((entry) => entry.nonce.trim())
    .filter(Boolean);
  await Promise.all(
    nonces.map((nonce) =>
      deleteWalletPrivateAddressScalarFromSdkState({ owner: trimmedOwner, nonce }),
    ),
  );
}
