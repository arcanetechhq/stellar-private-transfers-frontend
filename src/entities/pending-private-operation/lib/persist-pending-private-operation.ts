import type {
  PendingPrivateOperation,
  PendingPrivateOperationStore,
} from "@/shared/lib/protocol-relay/types.js";

const STORAGE_KEY_PREFIX = "stellar-payment-pending-private-op-v1";

function storageKeyForWallet(publicKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${publicKey}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDeliveryEntry(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.recipientPrivateAddress === "string" &&
    typeof value.commitmentHex === "string" &&
    typeof value.depositScalarHex === "string" &&
    typeof value.assetId === "string" &&
    typeof value.amountDisplay === "number" &&
    isRecord(value.coinNote)
  );
}

function hasRequiredOperationFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    typeof value.walletPublicKey === "string" &&
    typeof value.phase === "string" &&
    typeof value.retryAllowed === "boolean" &&
    typeof value.finalized === "boolean" &&
    typeof value.deliveriesDrained === "boolean" &&
    typeof value.transactionPersisted === "boolean"
  );
}

function isPendingOperation(value: unknown): value is PendingPrivateOperation {
  if (!isRecord(value) || !hasRequiredOperationFields(value)) {
    return false;
  }
  return (
    isRecord(value.display) &&
    isRecord(value.snapshot) &&
    isRecord(value.relayPackage) &&
    Array.isArray(value.deliveryOutbox) &&
    value.deliveryOutbox.every((entry) => isDeliveryEntry(entry))
  );
}

export function loadPendingPrivateOperations(
  publicKey: string,
): PendingPrivateOperation[] {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => isPendingOperation(item));
  } catch {
    return [];
  }
}

export function savePendingPrivateOperations(
  publicKey: string,
  operations: PendingPrivateOperation[],
): void {
  try {
    localStorage.setItem(
      storageKeyForWallet(publicKey),
      JSON.stringify(operations),
    );
  } catch {
    return;
  }
}

export function createLocalPendingPrivateOperationStore(): PendingPrivateOperationStore {
  return {
    save(operation) {
      const current = loadPendingPrivateOperations(operation.walletPublicKey);
      const next = current.filter((item) => item.id !== operation.id);
      next.push(operation);
      savePendingPrivateOperations(operation.walletPublicKey, next);
    },
    list(walletPublicKey) {
      return loadPendingPrivateOperations(walletPublicKey);
    },
    read(input) {
      return loadPendingPrivateOperations(input.walletPublicKey).find(
        (item) => item.id === input.operationId,
      );
    },
  };
}
