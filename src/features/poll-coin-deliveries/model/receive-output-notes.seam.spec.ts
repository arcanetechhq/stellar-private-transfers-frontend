import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  coinReducer,
  selectCoinItems,
} from "@/entities/coin/model/coin-slice.js";
import { coinDeliveryReducer } from "@/entities/coin-deliveries/model/coin-delivery.js";
import { receiveOutputNotes } from "./receive-output-notes.js";

jest.mock("@arcanetech/privacy-sdk-stellar", () =>
  jest.requireActual("../../../../test-shims/privacy-sdk-stellar.ts"),
);

jest.mock("@/entities/transaction/model/transaction.js", () => {
  const { createAction } = jest.requireActual(
    "@reduxjs/toolkit",
  ) as typeof import("@reduxjs/toolkit");
  return {
    addTransaction: createAction("transaction/addTransaction"),
  };
});

const PRIVATE_ADDRESS = "stpl1recipient";
const ASSET_ID = "USDC";
const LOOKUP_ASSET = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const POOL = "CPOOLADDRESS00000000000000000000000000000";
const PUBLIC_KEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const SCALAR = "aa".repeat(32);
const COMMITMENT = "ab".repeat(32);
const ENCRYPTED = "cd".repeat(64);
const EPHEMERAL_X = "11".repeat(32);
const EPHEMERAL_Y = "22".repeat(32);

function createTestStore() {
  const transactions = createSlice({
    name: "transaction",
    initialState: { items: [] as { id: string }[] },
    reducers: {
      addTransaction: (state, action: PayloadAction<{ id: string }>) => {
        state.items.unshift(action.payload);
      },
    },
  });
  return configureStore({
    reducer: {
      coin: coinReducer,
      coinDelivery: coinDeliveryReducer,
      transaction: transactions.reducer,
    },
    preloadedState: {
      coin: { items: [] },
      coinDelivery: { tagsByAssetId: {}, tagsHydrated: true },
      transaction: { items: [] },
    },
  });
}

describe("output note receive", () => {
  it("decrypts with the recipient scalar and the returned public point", async () => {
    const store = createTestStore();
    const uploads: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      uploads.push(String(input));
      return new Response(null, { status: 500 });
    }) as typeof fetch;
    const decryptedWith: Array<{
      recipientScalarHex: string;
      ephemeralX: string;
      ephemeralY: string;
    }> = [];
    try {
      await receiveOutputNotes({
        origin: "http://core.example/api/private-data",
        privateAddress: PRIVATE_ADDRESS,
        lookupAsset: LOOKUP_ASSET,
        recipientScalarHex: SCALAR,
        assetId: ASSET_ID,
        poolContract: POOL,
        publicKey: PUBLIC_KEY,
        seenTags: [],
        coinItems: selectCoinItems(store.getState()),
        localTransactionIds: [],
        dispatch: store.dispatch,
        loadRecords: async () => [
          {
            encryptedData: ENCRYPTED,
            ephemeralX: EPHEMERAL_X,
            ephemeralY: EPHEMERAL_Y,
          },
        ],
        decryptNote: async (input) => {
          decryptedWith.push({
            recipientScalarHex: input.recipientScalarHex,
            ephemeralX: input.ephemeralX,
            ephemeralY: input.ephemeralY,
          });
          return {
            value: "10000000",
            assetHi: "1",
            assetLo: "2",
            nullifier: "3",
            secret: "4",
            applicationId: "5",
            commitmentHex: COMMITMENT,
          };
        },
        assessIncomingNote: async () => ({ kind: "spendable" }),
        persistSpendableCoinToSdk: async () => undefined,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(decryptedWith).toEqual([
      {
        recipientScalarHex: SCALAR,
        ephemeralX: EPHEMERAL_X,
        ephemeralY: EPHEMERAL_Y,
      },
    ]);
    expect(selectCoinItems(store.getState())[0]?.commitmentHex).toBe(
      COMMITMENT,
    );
    expect(selectCoinItems(store.getState())[0]?.coin.commitment).toBe(
      BigInt(`0x${COMMITMENT}`).toString(),
    );
    expect(uploads).toEqual([]);
  });
});
