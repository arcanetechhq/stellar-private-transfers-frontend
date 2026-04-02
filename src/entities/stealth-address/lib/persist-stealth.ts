import type {
  StealthAddressState,
  StealthPersistedShape,
  StealthPersistedNonceEntry,
} from "../model/types";

function storageKeyForWallet(publicKey: string): string {
  return `stellar-payment-stealth-v1:${publicKey}`;
}

function isOptionalStringOrNullish(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string"
  );
}

function isNonceEntry(value: unknown): value is StealthPersistedNonceEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.stealthAddress !== "string" ||
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

function isPersistedShape(value: unknown): value is StealthPersistedShape {
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

export function loadStealthState(
  publicKey: string,
): StealthPersistedShape | undefined {
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

export function saveStealthState(
  publicKey: string,
  state: StealthPersistedShape,
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

export function readStealthRecordFromStorage(
  publicKey: string,
  nonce: string,
): StealthPersistedNonceEntry | undefined {
  const loaded = loadStealthState(publicKey);
  return loaded?.byNonce[nonce];
}

export function buildStealthPersistPayload(
  state: StealthAddressState,
): StealthPersistedShape {
  const byNonce: StealthPersistedShape["byNonce"] = {};
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
