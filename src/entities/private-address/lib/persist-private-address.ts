import type {
  PrivateAddressState,
  PrivateAddressPersistedShape,
  PrivateAddressPersistedNonceEntry,
} from "../model/types";

function storageKeyForWallet(publicKey: string): string {
  return `stellar-payment-private-address-v1:${publicKey}`;
}

function isOptionalStringOrNullish(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string"
  );
}

function isNonceEntry(value: unknown): value is PrivateAddressPersistedNonceEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.privateAddress !== "string" ||
    typeof record.createdAt !== "number"
  ) {
    return false;
  }
  if (
    record.recipientScalarHex !== undefined &&
    typeof record.recipientScalarHex !== "string"
  ) {
    return false;
  }
  return true;
}

function isPersistedShape(value: unknown): value is PrivateAddressPersistedShape {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!isOptionalStringOrNullish(record.defaultNonce)) {
    return false;
  }
  if (typeof record.byNonce !== "object" || record.byNonce === null) {
    return false;
  }
  const byNonce = record.byNonce as Record<string, unknown>;
  for (const [key, entry] of Object.entries(byNonce)) {
    if (typeof key !== "string" || !isNonceEntry(entry)) {
      return false;
    }
  }
  return true;
}

export function loadPrivateAddressState(
  publicKey: string,
): PrivateAddressPersistedShape | undefined {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedShape(parsed)) {
      return undefined;
    }
    return {
      ...parsed,
      defaultNonce: parsed.defaultNonce ?? undefined,
    };
  } catch {
    return undefined;
  }
}

export function savePrivateAddressState(
  publicKey: string,
  state: PrivateAddressPersistedShape,
): void {
  try {
    localStorage.setItem(
      storageKeyForWallet(publicKey),
      JSON.stringify(state),
    );
  } catch {
    return;
  }
}

export function readPrivateAddressRecordFromStorage(
  publicKey: string,
  nonce: string,
): PrivateAddressPersistedNonceEntry | undefined {
  const loaded = loadPrivateAddressState(publicKey);
  return loaded?.byNonce[nonce];
}

export function buildPrivateAddressPersistPayload(
  state: PrivateAddressState,
): PrivateAddressPersistedShape {
  const byNonce: PrivateAddressPersistedShape["byNonce"] = {};
  for (const [nonceKey, entry] of Object.entries(state.byNonce)) {
    const scalarHex = state.scalarByNonce[nonceKey]?.trim();
    byNonce[nonceKey] =
      scalarHex !== undefined && scalarHex !== ""
        ? { ...entry, recipientScalarHex: scalarHex }
        : { ...entry };
  }
  return {
    byNonce,
    defaultNonce: state.defaultNonce,
  };
}
