import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { pkcs8BytesFromPem } from "./pem-to-pkcs8";

const DATABASE_NAME = "arcane-fireblocks-custodian";
const DATABASE_VERSION = 1;
const SIGNING_KEY_STORE = "signing-keys";
const SIGNING_KEY_ID = "fireblocks-api";
const SIGNING_ALGORITHM = {
  name: "RSASSA-PKCS1-v1_5",
  hash: "SHA-256",
} as const;

function requestToPromise<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new FireblocksWizardError("key-store"));
    });
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => {
      resolve();
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new FireblocksWizardError("key-store"));
    });
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new FireblocksWizardError("key-store"));
    });
  });
}

function openSigningKeyDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SIGNING_KEY_STORE)) {
        database.createObjectStore(SIGNING_KEY_STORE);
      }
    });
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new FireblocksWizardError("key-store"));
    });
  });
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export async function importPemSigningKey(pemText: string): Promise<CryptoKey> {
  const pkcs8 = toArrayBuffer(pkcs8BytesFromPem(pemText));
  try {
    const signingKey = await crypto.subtle.importKey(
      "pkcs8",
      pkcs8,
      SIGNING_ALGORITHM,
      false,
      ["sign"],
    );
    if (signingKey.extractable) {
      throw new FireblocksWizardError("invalid-pem");
    }
    return signingKey;
  } catch (error) {
    if (error instanceof FireblocksWizardError) {
      throw error;
    }
    throw new FireblocksWizardError("invalid-pem");
  }
}

async function withSigningKeyDatabase<Result>(
  mode: IDBTransactionMode,
  read: (store: IDBObjectStore, transaction: IDBTransaction) => Promise<Result>,
): Promise<Result> {
  const database = await openSigningKeyDatabase();
  try {
    const transaction = database.transaction(SIGNING_KEY_STORE, mode);
    return await read(transaction.objectStore(SIGNING_KEY_STORE), transaction);
  } catch (error) {
    if (error instanceof FireblocksWizardError) {
      throw error;
    }
    throw new FireblocksWizardError("key-store");
  } finally {
    database.close();
  }
}

export async function storeSigningKey(signingKey: CryptoKey): Promise<void> {
  if (signingKey.extractable) {
    throw new FireblocksWizardError("invalid-pem");
  }
  await withSigningKeyDatabase("readwrite", async (store, transaction) => {
    store.put(signingKey, SIGNING_KEY_ID);
    await transactionDone(transaction);
  });
}

export async function deleteSigningKey(): Promise<void> {
  try {
    await withSigningKeyDatabase("readwrite", async (store, transaction) => {
      store.delete(SIGNING_KEY_ID);
      await transactionDone(transaction);
    });
  } catch {
    return;
  }
}

export async function readSigningKey(): Promise<CryptoKey | undefined> {
  return withSigningKeyDatabase("readonly", async (store) => {
    const stored = await requestToPromise(store.get(SIGNING_KEY_ID));
    return stored instanceof CryptoKey ? stored : undefined;
  });
}

export async function resolveSigningKey(pemText: string): Promise<CryptoKey> {
  const trimmed = pemText.trim();
  if (trimmed.length > 0) {
    const signingKey = await importPemSigningKey(trimmed);
    await storeSigningKey(signingKey);
    return signingKey;
  }
  const stored = await readSigningKey();
  if (stored === undefined) {
    throw new FireblocksWizardError("missing-pem");
  }
  return stored;
}
