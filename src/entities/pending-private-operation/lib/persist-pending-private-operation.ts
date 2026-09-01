import type {
  DeliveryOutboxEntry,
  PendingPrivateOperation,
  PendingPrivateOperationStore,
} from "@/shared/lib/protocol-relay/types.js";
import {
  decryptDeliveryOutboxPayload,
  encryptDeliveryOutboxPayload,
  isEncryptedDeliveryOutbox,
} from "./encrypt-delivery-outbox.js";

const STORAGE_KEY_PREFIX = "stellar-payment-pending-private-op-v1";

function storageKeyForWallet(publicKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${publicKey}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDeliveryEntry(value: unknown): value is DeliveryOutboxEntry {
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

function readDeliveryEntries(value: unknown): DeliveryOutboxEntry[] | undefined {
  if (!Array.isArray(value) || !value.every((entry) => isDeliveryEntry(entry))) {
    return undefined;
  }
  return value;
}

async function serializeOperationForStorage(
  operation: PendingPrivateOperation,
): Promise<Record<string, unknown>> {
  const envelope = await encryptDeliveryOutboxPayload({
    walletPublicKey: operation.walletPublicKey,
    payload: {
      deliveryOutbox: operation.deliveryOutbox,
      outputRecords: operation.snapshot.outputRecords,
    },
  });
  return {
    ...operation,
    snapshot: {
      ...operation.snapshot,
      outputRecords: [],
    },
    deliveryOutbox: envelope,
  };
}

async function decryptStoredOutbox(input: {
  walletPublicKey: string;
  deliveryOutbox: unknown;
}): Promise<{
  deliveryOutbox: DeliveryOutboxEntry[];
  outputRecords: DeliveryOutboxEntry[];
} | undefined> {
  if (!isEncryptedDeliveryOutbox(input.deliveryOutbox)) {
    return undefined;
  }
  const payload = await decryptDeliveryOutboxPayload({
    walletPublicKey: input.walletPublicKey,
    envelope: input.deliveryOutbox,
  });
  const deliveryOutbox = readDeliveryEntries(payload.deliveryOutbox);
  const outputRecords = readDeliveryEntries(payload.outputRecords);
  if (!deliveryOutbox || !outputRecords) {
    return undefined;
  }
  return { deliveryOutbox, outputRecords };
}

async function deserializeOperation(
  value: unknown,
): Promise<PendingPrivateOperation | undefined> {
  try {
    if (!isRecord(value) || !hasRequiredOperationFields(value)) {
      return undefined;
    }
    if (!isRecord(value.display) || !isRecord(value.snapshot) || !isRecord(value.relayPackage)) {
      return undefined;
    }
    const decrypted = await decryptStoredOutbox({
      walletPublicKey: value.walletPublicKey as string,
      deliveryOutbox: value.deliveryOutbox,
    });
    if (!decrypted) {
      return undefined;
    }
    return {
      ...(value as unknown as PendingPrivateOperation),
      snapshot: {
        ...(value.snapshot as PendingPrivateOperation["snapshot"]),
        outputRecords: decrypted.outputRecords,
      },
      deliveryOutbox: decrypted.deliveryOutbox,
    };
  } catch {
    return undefined;
  }
}

export async function loadPendingPrivateOperations(
  publicKey: string,
): Promise<PendingPrivateOperation[]> {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const loaded = await Promise.all(parsed.map((item) => deserializeOperation(item)));
    return loaded.filter((item): item is PendingPrivateOperation => item !== undefined);
  } catch {
    return [];
  }
}

export async function savePendingPrivateOperations(
  publicKey: string,
  operations: PendingPrivateOperation[],
): Promise<void> {
  try {
    const encrypted = await Promise.all(
      operations.map((item) => serializeOperationForStorage(item)),
    );
    localStorage.setItem(storageKeyForWallet(publicKey), JSON.stringify(encrypted));
  } catch {
    return;
  }
}

export function createLocalPendingPrivateOperationStore(): PendingPrivateOperationStore {
  return {
    async save(operation) {
      const current = await loadPendingPrivateOperations(operation.walletPublicKey);
      const next = current.filter((item) => item.id !== operation.id);
      next.push(operation);
      await savePendingPrivateOperations(operation.walletPublicKey, next);
    },
    list(walletPublicKey) {
      return loadPendingPrivateOperations(walletPublicKey);
    },
    async read(input) {
      const items = await loadPendingPrivateOperations(input.walletPublicKey);
      return items.find((item) => item.id === input.operationId);
    },
  };
}
