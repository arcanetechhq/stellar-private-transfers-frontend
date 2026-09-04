import {
  claimNoteKey,
  claimNoteOnce,
  rememberClaimedNoteKey,
  resetClaimNoteOnceForTests,
} from "./claim-note-once";
import {
  claimedEscrowNotesStorageKey,
  loadClaimedEscrowNoteKeys,
  saveClaimedEscrowNoteKey,
} from "./persist-claimed-escrow-notes";

const CLAIMANT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const OTHER = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBH5C";
const NOTE_KEY = claimNoteKey("tx-escrow-1", 0);

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

describe("persisted claimed escrow notes", () => {
  const original = globalThis.localStorage;

  beforeEach(() => {
    resetClaimNoteOnceForTests();
    installMemoryLocalStorage();
  });

  afterEach(() => {
    resetClaimNoteOnceForTests();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: original,
    });
  });

  it("stores claimed keys per stellar address", () => {
    saveClaimedEscrowNoteKey({ stellarAddress: CLAIMANT, key: NOTE_KEY });
    expect(claimedEscrowNotesStorageKey(CLAIMANT)).toBe(
      `stellar-payment-escrow-claimed-v1:${CLAIMANT}`,
    );
    expect(loadClaimedEscrowNoteKeys(CLAIMANT)).toEqual([NOTE_KEY]);
    expect(loadClaimedEscrowNoteKeys(OTHER)).toEqual([]);
  });

  it("skips a second claim after hydrating stored keys for that address", async () => {
    saveClaimedEscrowNoteKey({ stellarAddress: CLAIMANT, key: NOTE_KEY });
    for (const key of loadClaimedEscrowNoteKeys(CLAIMANT)) {
      rememberClaimedNoteKey(key);
    }
    let starts = 0;
    await claimNoteOnce(NOTE_KEY, async () => {
      starts += 1;
    });
    expect(starts).toBe(0);
  });
});
