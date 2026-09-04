import {
  escrowTagsStorageKey,
  localStorageEscrowTagStore,
} from "./persist-escrow-tags";

const OWNER = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const OTHER = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBH5C";
const TAG = "aa901161e699ab3d4ca43cd15e575408441197eba93de07e5da6a2826d2e82d9";
const TAGS = [{ epoch: 1, tag: TAG }];

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

describe("persisted escrow tags", () => {
  const original = globalThis.localStorage;

  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: original,
    });
  });

  it("stores tags under a key scoped to the signer address", () => {
    localStorageEscrowTagStore.write({ signerAddress: OWNER, tags: TAGS });
    expect(escrowTagsStorageKey(OWNER)).toBe(
      `stellar-payment-escrow-tags-v1:${OWNER}`,
    );
    expect(localStorage.getItem(escrowTagsStorageKey(OWNER))).toBe(
      JSON.stringify(TAGS),
    );
    expect(localStorageEscrowTagStore.read(OWNER)).toEqual(TAGS);
    expect(localStorageEscrowTagStore.read(OTHER)).toBeUndefined();
  });
});
