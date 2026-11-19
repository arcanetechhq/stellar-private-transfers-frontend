import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  coinReducer,
  selectCoinItems,
} from "@/entities/coin/model/coin-slice.js";
import type { CoinData, CoinWithMetadata } from "@/entities/coin/model/coin.js";
import {
  coinDeliveryReducer,
  selectSeenTagsForAsset,
} from "@/entities/coin-deliveries/model/coin-delivery.js";

jest.mock("@/entities/transaction/model/transaction.js", () => {
  const { createAction } = jest.requireActual(
    "@reduxjs/toolkit",
  ) as typeof import("@reduxjs/toolkit");
  return {
    addTransaction: createAction("transaction/addTransaction"),
  };
});

import { processIncomingDeliveryRows } from "./process-incoming-delivery-rows.js";

const PRIVATE_ADDRESS = "stpl1recipient";
const ASSET_ID = "USDC";
const POOL = "CPOOLADDRESS00000000000000000000000000000";
const PUBLIC_KEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const SCALAR =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TAG = "dGFnLXNwZW5kYWJsZQ==";
const COMMITMENT =
  "1111111111111111111111111111111111111111111111111111111111111111";
const DEPOSIT_TX =
  "d1b3c9856408901952349721282d160ed0643cfa7e9804745bf0e576fbbecc5b";

function coinData(commitment: string): CoinData {
  return {
    value: "10000000",
    nullifier: "9",
    secret: "8",
    commitment,
    asset_hi: "0",
    asset_lo: "1",
  };
}

function heldCoin(): CoinWithMetadata {
  return {
    commitmentHex: COMMITMENT,
    coin: coinData(COMMITMENT),
    privateAddress: PRIVATE_ADDRESS,
    assetId: ASSET_ID,
    poolContract: POOL,
    amountDisplay: 1,
    status: "finalized",
    txId: DEPOSIT_TX,
  };
}

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

describe("deposit output note", () => {
  it("does not record a receipt when the deposit stores the coin during assessment", async () => {
    const store = createTestStore();
    let stored = false;

    await processIncomingDeliveryRows({
      rows: [
        {
          id: 1,
          tag_base64: TAG,
          created_at: "2026-09-29T12:00:00.000Z",
        },
      ],
      seenTags: [],
      coinItems: [],
      readCoinItems: () => (stored ? [heldCoin()] : []),
      recipientScalarHex: SCALAR,
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      publicKey: PUBLIC_KEY,
      localTransactionIds: [],
      dispatch: store.dispatch,
      decryptDeliveryRow: async () => ({
        commitmentHex: COMMITMENT,
        coin: coinData(COMMITMENT),
        amountDisplay: 1,
        txId: "output-note-111111111111",
      }),
      assessIncomingNote: async () => {
        stored = true;
        return { kind: "spendable" };
      },
      markDeliveryProcessed: async () => {},
      persistSpendableCoinToSdk: async () => {},
    });

    expect(store.getState().transaction.items).toEqual([]);
    expect(selectCoinItems(store.getState())).toEqual([]);
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([TAG]);
  });
});
