import * as StellarPrivacySdk from "@arcanetech/privacy-sdk-stellar";
import { getPrivacySdkClientOrThrow } from "./transact-context.js";

type PrivacySdkStateRoot = { privacySdkState?: unknown };
type WalletScalarSnapshot = { owner: string; nonce: string; scalarHex: string };
type ReadScalarFromSnapshot = (input: {
  state: unknown;
  owner: string;
  nonce: string;
}) => WalletScalarSnapshot | undefined;
type ListScalarsForOwnerFromSnapshot = (input: {
  state: unknown;
  owner: string;
}) => WalletScalarSnapshot[];

const readWalletPrivateAddressScalarFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    readWalletPrivateAddressScalarFromStateSnapshot?: ReadScalarFromSnapshot;
  }
).readWalletPrivateAddressScalarFromStateSnapshot;

const listWalletPrivateAddressScalarsForOwnerFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    listWalletPrivateAddressScalarsForOwnerFromStateSnapshot?: ListScalarsForOwnerFromSnapshot;
  }
).listWalletPrivateAddressScalarsForOwnerFromStateSnapshot;

function readWalletScalarsRecord(
  branch: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const wallet = branch.wallet;
  if (typeof wallet !== "object" || wallet === null || Array.isArray(wallet)) {
    return undefined;
  }
  const scalars = (wallet as Record<string, unknown>).privateAddressScalars;
  if (
    typeof scalars !== "object" ||
    scalars === null ||
    Array.isArray(scalars)
  ) {
    return undefined;
  }
  return scalars as Record<string, unknown>;
}

function readScalarHexFromEntry(entry: unknown): string | undefined {
  if (typeof entry === "string") {
    return entry.trim() || undefined;
  }
  if (typeof entry !== "object" || entry === null) {
    return undefined;
  }
  const scalarHex = (entry as Record<string, unknown>).scalarHex;
  return typeof scalarHex === "string"
    ? scalarHex.trim() || undefined
    : undefined;
}

export function readWalletScalarHexFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
  nonce: string;
}): string | undefined {
  const scalars = readWalletScalarsRecord(input.branch);
  if (!scalars) {
    return undefined;
  }
  const key = `${input.owner.trim()}:${input.nonce.trim()}`;
  return readScalarHexFromEntry(scalars[key]);
}

export function readWalletScalarHexFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
  nonce: string;
}): string | undefined {
  return readWalletPrivateAddressScalarFromStateSnapshot?.(
    input,
  )?.scalarHex.trim();
}

export async function saveWalletPrivateAddressScalarToSdkState(input: {
  owner: string;
  nonce: string;
  scalarHex: string;
}): Promise<void> {
  const owner = input.owner.trim();
  const nonce = input.nonce.trim();
  const scalarHex = input.scalarHex.trim();
  if (!owner || !nonce || !scalarHex) {
    return;
  }
  await getPrivacySdkClientOrThrow().saveWalletPrivateAddressScalar({
    owner,
    nonce,
    scalarHex,
    updatedAt: new Date().toISOString(),
  });
}

export function listWalletScalarsForOwnerFromSdkBranch(input: {
  branch: Record<string, unknown>;
  owner: string;
}): Array<{ nonce: string; scalarHex: string }> {
  const trimmedOwner = input.owner.trim();
  if (!trimmedOwner) {
    return [];
  }
  const scalars = readWalletScalarsRecord(input.branch);
  if (!scalars) {
    return [];
  }
  const prefix = `${trimmedOwner}:`;
  const results: Array<{ nonce: string; scalarHex: string }> = [];
  for (const key of Object.keys(scalars)) {
    if (!key.startsWith(prefix)) {
      continue;
    }
    const nonce = key.slice(prefix.length).trim();
    const scalarHex = readWalletScalarHexFromSdkBranch({
      branch: input.branch,
      owner: trimmedOwner,
      nonce,
    });
    if (nonce && scalarHex) {
      results.push({ nonce, scalarHex });
    }
  }
  return results;
}

export function listWalletScalarsForOwnerFromSdkState(input: {
  state: PrivacySdkStateRoot;
  owner: string;
}): Array<{ nonce: string; scalarHex: string }> {
  return (
    listWalletPrivateAddressScalarsForOwnerFromStateSnapshot?.(input) ?? []
  ).map((entry) => ({
    nonce: entry.nonce.trim(),
    scalarHex: entry.scalarHex.trim(),
  }));
}
