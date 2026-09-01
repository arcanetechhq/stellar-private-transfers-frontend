import type { PendingPrivateOperation } from "@/shared/lib/protocol-relay/types.js";
import { PENDING_OPERATION_PHASE } from "@/shared/lib/protocol-relay/types.js";
import {
  loadPendingPrivateOperations,
  savePendingPrivateOperations,
} from "./persist-pending-private-operation.js";

const STORAGE_PREFIX = "stellar-payment-pending-private-op-v1";

const TEST_WALLET = "GTESTWALLETPERSIST";
const PLAINTEXT_NOTE = "coin-note-plaintext-secret-value";
const PLAINTEXT_SCALAR = "deadbeefdepositscalarplaintext";
const PLAINTEXT_RECIPIENT = "stpl1recipient-secret-address";
const PLAINTEXT_COMMITMENT = "ffffffffffffffffcommitmentnote";

function installMemoryLocalStorage(): void {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key);
    },
    key(index: number) {
      return [...data.keys()][index];
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
}

function sampleOperation(): PendingPrivateOperation {
  const entry = {
    recipientPrivateAddress: PLAINTEXT_RECIPIENT,
    commitmentHex: PLAINTEXT_COMMITMENT,
    coinNote: { value: PLAINTEXT_NOTE },
    depositScalarHex: PLAINTEXT_SCALAR,
    assetId: "USDC",
    amountDisplay: 1,
  };
  return {
    id: "op-persist-1",
    walletPublicKey: TEST_WALLET,
    phase: PENDING_OPERATION_PHASE.relayAccepted,
    retryAllowed: false,
    display: {
      kind: "withdraw",
      assetId: "USDC",
      amountDisplay: 10,
      counterparty: TEST_WALLET,
      senderPrivateAddress: "stpl1sender",
    },
    snapshot: {
      consumedRecordIds: ["note-1"],
      outputRecords: [entry],
    },
    deliveryOutbox: [entry],
    relayPackage: {
      version: 1,
      poolSelector: "CPOOL",
      zkConfigNonce: "0",
      proofBytes: "aa",
      publicSignals: "bb",
      applicationIdHints: ["1", "1", "0", "0"],
    },
    finalized: false,
    deliveriesDrained: false,
    transactionPersisted: false,
    relayRequestId: "relay-persist-1",
  };
}

function storedRaw(): string {
  const raw = localStorage.getItem(
    `${STORAGE_PREFIX}:${TEST_WALLET}`,
  );
  if (!raw) {
    throw new Error("expected wallet-scoped pending operation storage");
  }
  return raw;
}

describe("pending private operation persistence", () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it("stores delivery outbox entries as ciphertext, not plaintext notes", async () => {
    await savePendingPrivateOperations(TEST_WALLET, [sampleOperation()]);
    const raw = storedRaw();
    expect(raw).not.toContain(PLAINTEXT_NOTE);
    expect(raw).not.toContain(PLAINTEXT_SCALAR);
    expect(raw).not.toContain(PLAINTEXT_RECIPIENT);
    expect(raw).not.toContain(PLAINTEXT_COMMITMENT);
    expect(raw).toContain("ciphertext");
  });

  it("round-trips decrypted delivery outbox entries from wallet-scoped storage", async () => {
    const original = sampleOperation();
    await savePendingPrivateOperations(TEST_WALLET, [original]);
    const loaded = await loadPendingPrivateOperations(TEST_WALLET);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.deliveryOutbox).toEqual(original.deliveryOutbox);
    expect(loaded[0]?.snapshot.outputRecords).toEqual(
      original.snapshot.outputRecords,
    );
    expect(loaded[0]?.relayRequestId).toBe("relay-persist-1");
  });

  it("does not load plaintext delivery outbox entries from storage", async () => {
    localStorage.setItem(
      `${STORAGE_PREFIX}:${TEST_WALLET}`,
      JSON.stringify([sampleOperation()]),
    );
    const loaded = await loadPendingPrivateOperations(TEST_WALLET);
    expect(loaded).toEqual([]);
  });
});
