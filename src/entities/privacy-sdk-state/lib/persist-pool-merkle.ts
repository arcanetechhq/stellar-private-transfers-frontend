import type { StellarPoolMerkleState } from "@arcanetech/privacy-sdk-stellar";
import { isPoolMerkleState } from "./privacy-sdk-branch.js";

const DB_NAME = "arcane-pool-merkle-v1";
const STORE_NAME = "byContract";
const DB_VERSION = 1;

function requestToPromise<Value>(request: IDBRequest<Value>): Promise<Value> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed"));
    };
  });
}

function openPoolMerkleDatabase(): Promise<IDBDatabase> {
  if (globalThis.indexedDB === undefined) {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }
  const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME);
    }
  };
  return requestToPromise(request);
}

async function withStore<Value>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<Value>,
): Promise<Value> {
  const database = await openPoolMerkleDatabase();
  try {
    const store = database.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
    return await run(store);
  } finally {
    database.close();
  }
}

export async function savePoolMerkleState(
  state: StellarPoolMerkleState,
): Promise<void> {
  const poolContract = state.poolContract.trim();
  if (!poolContract) {
    return;
  }
  try {
    await withStore("readwrite", async (store) => {
      await requestToPromise(store.put(state, poolContract));
    });
  } catch {
    return;
  }
}

export async function savePoolMerkleStates(
  states: StellarPoolMerkleState[],
): Promise<void> {
  for (const state of states) {
    await savePoolMerkleState(state);
  }
}

export async function loadAllPoolMerkleStates(): Promise<StellarPoolMerkleState[]> {
  try {
    const values = await withStore("readonly", async (store) => {
      return requestToPromise(store.getAll());
    });
    return values.filter((value) => isPoolMerkleState(value));
  } catch {
    return [];
  }
}
