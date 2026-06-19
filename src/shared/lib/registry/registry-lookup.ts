import { Buffer } from "buffer";
import type { PrivateAddressRecord } from "registry-contract";
import { createRegistryContractClient } from "@/shared/stellar/create-registry-contract-client";
import { encodePrivateAddressFromHexCoordinates } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";

export type RegistryLookupResult =
  | {
      status: "registered";
      privateAddressStpl1: string;
      publicKeyXHex: string;
      publicKeyYHex: string;
    }
  | { status: "unregistered" };

function readCoordinateBytes(value: unknown): Buffer | undefined {
  if (value instanceof Buffer) {
    return value;
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  return undefined;
}

function normalizePrivateAddressRecord(
  value: unknown,
): PrivateAddressRecord | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const publicKeyX = readCoordinateBytes(record.public_key_x);
  const publicKeyY = readCoordinateBytes(record.public_key_y);
  if (typeof record.owner !== "string" || !publicKeyX || !publicKeyY) {
    return undefined;
  }
  return {
    owner: record.owner,
    public_key_x: publicKeyX,
    public_key_y: publicKeyY,
    updated_at_ledger: Number(record.updated_at_ledger ?? 0),
  };
}

function parseOptionSomeRecord(result: unknown): PrivateAddressRecord | undefined {
  if (!result || typeof result !== "object" || !("tag" in result)) {
    return undefined;
  }
  const option = result as { tag?: unknown; values?: unknown };
  if (option.tag !== "Some" || !Array.isArray(option.values)) {
    return undefined;
  }
  return normalizePrivateAddressRecord(option.values[0]);
}

function parseRegistryLookupRecord(result: unknown): PrivateAddressRecord | undefined {
  const directRecord = normalizePrivateAddressRecord(result);
  if (directRecord) {
    return directRecord;
  }
  return parseOptionSomeRecord(result);
}

function recordToLookupResult(
  record: PrivateAddressRecord,
): Extract<RegistryLookupResult, { status: "registered" }> {
  const publicKeyXHex = Buffer.from(record.public_key_x).toString("hex");
  const publicKeyYHex = Buffer.from(record.public_key_y).toString("hex");
  return {
    status: "registered",
    privateAddressStpl1: encodePrivateAddressFromHexCoordinates(
      publicKeyXHex,
      publicKeyYHex,
    ),
    publicKeyXHex,
    publicKeyYHex,
  };
}

export async function lookupRecipientPrivateAddress(parameters: {
  registryContractId: string;
  recipientStellarAddress: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<RegistryLookupResult> {
  const client = createRegistryContractClient({
    contractId: parameters.registryContractId,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  const read = await client.get_private_address({
    owner: parameters.recipientStellarAddress.trim(),
  });
  const record = parseRegistryLookupRecord(read.result);
  if (!record) {
    return { status: "unregistered" };
  }
  return recordToLookupResult(record);
}

export async function lookupWalletRegistryStatus(parameters: {
  registryContractId: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<RegistryLookupResult> {
  return lookupRecipientPrivateAddress({
    registryContractId: parameters.registryContractId,
    recipientStellarAddress: parameters.walletPublicKey,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
}
