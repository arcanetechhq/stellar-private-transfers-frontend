import { isValidPrivateAddressString } from "@/shared/lib/private-address/validate-private-address";
import type { Contact, ContactState } from "../model/contact";

const STORAGE_KEY = "stellar-payment-contact-v1";

function migrateItem(value: unknown): Contact | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "number" || typeof record.name !== "string") {
    return undefined;
  }
  if (typeof record.privateAddress === "string") {
    return {
      id: record.id,
      name: record.name,
      privateAddress: record.privateAddress,
    };
  }
  if (typeof record.address === "string") {
    const trimmed = record.address.trim();
    if (isValidPrivateAddressString(trimmed)) {
      return {
        id: record.id,
        name: record.name,
        privateAddress: trimmed,
      };
    }
    return undefined;
  }
  return undefined;
}

export function loadContactState(): ContactState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("items" in parsed)) {
      return undefined;
    }
    const itemsUnknown = (parsed as { items: unknown }).items;
    if (!Array.isArray(itemsUnknown)) {
      return undefined;
    }
    const items = itemsUnknown
      .map((value: unknown) => migrateItem(value))
      .filter((item): item is Contact => item !== undefined);
    return { items };
  } catch {
    return undefined;
  }
}

export function saveContactState(state: ContactState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
