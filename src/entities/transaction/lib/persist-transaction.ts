import type { Transaction } from "../model/transaction";

function storageKeyForWallet(publicKey: string): string {
  return `stellar-payment-tx-v1:${publicKey}`;
}

function hasRequiredStringFields(record: Record<string, unknown>): boolean {
  return (
    typeof record.id === "string" &&
    typeof record.date === "string" &&
    typeof record.type === "string" &&
    typeof record.assetId === "string" &&
    typeof record.counterparty === "string" &&
    typeof record.status === "string" &&
    typeof record.confirmationStatus === "string" &&
    typeof record.disclosureStatus === "string"
  );
}

function hasOptionalSenderStealthField(record: Record<string, unknown>): boolean {
  const value = record.senderStealthAddress;
  return value === undefined || typeof value === "string";
}

function isTransactionItem(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    hasRequiredStringFields(record) &&
    typeof record.amount === "number" &&
    hasOptionalSenderStealthField(record)
  );
}

export function loadTransactionState(
  publicKey: string,
): Transaction[] | undefined {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return undefined;
    }
    const items = parsed.filter((item: unknown) => isTransactionItem(item));
    return items as Transaction[];
  } catch {
    return undefined;
  }
}

export function saveTransactionState(
  publicKey: string,
  items: Transaction[],
): void {
  try {
    const previousItems = loadTransactionState(publicKey);
    if (previousItems && items.length < previousItems.length) {
      return;
    }
    localStorage.setItem(storageKeyForWallet(publicKey), JSON.stringify(items));
  } catch {
    return;
  }
}
