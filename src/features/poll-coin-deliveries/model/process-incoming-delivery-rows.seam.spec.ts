import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  coinReducer,
  selectCoinItems,
  selectFinalizedAggregatesForPrivateAddress,
} from "@/entities/coin/model/coin-slice.js";
import type {
  CoinData,
  CoinWithMetadata,
} from "@/entities/coin/model/coin.js";
import { pickPrivateSpendCoins } from "@/entities/coin/lib/private-spend-coin-selection.js";
import {
  coinDeliveryReducer,
  selectSeenTagsForAsset,
} from "@/entities/coin-deliveries/model/coin-delivery.js";
import type { IncomingNoteAssessment } from "@arcanetech/privacy-sdk-stellar";

jest.mock("@/entities/transaction/model/transaction.js", () => {
  const { createAction } = jest.requireActual("@reduxjs/toolkit") as typeof import("@reduxjs/toolkit");
  return {
    addTransaction: createAction("transaction/addTransaction"),
  };
});

import { processIncomingDeliveryRows } from "./process-incoming-delivery-rows.js";
import { pollSpentNullifiersForCoins } from "./poll-spent-nullifiers.js";

type SeamTransaction = {
  id: string;
  status: string;
  invalidIncomingReason?: string;
};

const seamTransactionSlice = createSlice({
  name: "transaction",
  initialState: { items: [] as SeamTransaction[] },
  reducers: {
    addTransaction: (state, action: PayloadAction<SeamTransaction>) => {
      state.items.unshift(action.payload);
    },
  },
});

function selectSeamTransactions(state: {
  transaction: { items: SeamTransaction[] };
}): SeamTransaction[] {
  return state.transaction.items;
}

const PRIVATE_ADDRESS = "stpl1recipient";
const ASSET_ID = "USDC";
const POOL = "CPOOLADDRESS00000000000000000000000000000";
const PUBLIC_KEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const SCALAR = "aa".repeat(32);
const TAG_SPENDABLE = "dGFnLXNwZW5kYWJsZQ==";
const TAG_PENDING = "dGFnLXBlbmRpbmc=";
const TAG_DEAD = "dGFnLWRlYWQ=";
const COMMIT_SPENDABLE =
  "1111111111111111111111111111111111111111111111111111111111111111";
const COMMIT_PENDING =
  "2222222222222222222222222222222222222222222222222222222222222222";
const COMMIT_DEAD =
  "3333333333333333333333333333333333333333333333333333333333333333";
const NOTE_VALUE = "10000000";

function coinData(commitment: string): CoinData {
  return {
    value: NOTE_VALUE,
    nullifier: "9",
    secret: "8",
    commitment,
    asset_hi: "0",
    asset_lo: "1",
  };
}

function decryptedFor(
  commitmentHex: string,
  tagBase64: string,
  rowId: number,
) {
  return {
    row: {
      id: rowId,
      asset_id: ASSET_ID,
      ciphertext_base64: "Y2lwaGVy",
      ephemeral_key: "01".repeat(32),
      tag_base64: tagBase64,
      created_at: "2026-09-29T12:00:00.000Z",
    },
    decrypted: {
      commitmentHex,
      coin: coinData(commitmentHex),
      depositScalarHex: "bb".repeat(32),
      amountDisplay: 1,
      txId: `tx-${commitmentHex.slice(0, 8)}`,
    },
  };
}

function createTestStore(items: CoinWithMetadata[] = []) {
  return configureStore({
    reducer: {
      coin: coinReducer,
      coinDelivery: coinDeliveryReducer,
      transaction: seamTransactionSlice.reducer,
    },
    preloadedState: {
      coin: { items },
      coinDelivery: { tagsByAssetId: {}, tagsHydrated: true },
      transaction: { items: [] },
    },
  });
}

const noopPersist = async () => undefined;

describe("incoming delivery assessment", () => {
  it("finalizes a spendable delivery and marks its tag seen", async () => {
    const store = createTestStore();
    const { row, decrypted } = decryptedFor(COMMIT_SPENDABLE, TAG_SPENDABLE, 1);
    const marked: number[] = [];
    const assessments: IncomingNoteAssessment[] = [];

    await processIncomingDeliveryRows({
      rows: [row],
      seenTags: [],
      coinItems: selectCoinItems(store.getState()),
      recipientScalarHex: SCALAR,
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      publicKey: PUBLIC_KEY,
      localTransactionIds: [],
      dispatch: store.dispatch,
      decryptDeliveryRow: async () => decrypted,
      assessIncomingNote: async () => {
        assessments.push({ kind: "spendable" });
        return { kind: "spendable" };
      },
      markDeliveryProcessed: async (deliveryId) => {
        marked.push(deliveryId);
      },
      persistSpendableCoinToSdk: noopPersist,
    });

    const coins = selectCoinItems(store.getState());
    expect(coins).toHaveLength(1);
    expect(coins[0]?.status).toBe("finalized");
    expect(coins[0]?.commitmentHex).toBe(COMMIT_SPENDABLE);
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([
      TAG_SPENDABLE,
    ]);
    expect(marked).toEqual([1]);
    expect(assessments).toEqual([{ kind: "spendable" }]);
    expect(selectSeamTransactions(store.getState())[0]?.status).toBe("completed");
  });

  it("does not record a receipt for a commitment the wallet already holds", async () => {
    const held: CoinWithMetadata = {
      commitmentHex: COMMIT_SPENDABLE,
      coin: coinData(COMMIT_SPENDABLE),
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      amountDisplay: 1,
      status: "finalized",
    };
    const store = createTestStore([held]);
    const { row, decrypted } = decryptedFor(
      COMMIT_SPENDABLE,
      TAG_SPENDABLE,
      1,
    );
    const assessments: IncomingNoteAssessment[] = [];

    await processIncomingDeliveryRows({
      rows: [row],
      seenTags: [],
      coinItems: selectCoinItems(store.getState()),
      recipientScalarHex: SCALAR,
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      publicKey: PUBLIC_KEY,
      localTransactionIds: [],
      dispatch: store.dispatch,
      decryptDeliveryRow: async () => decrypted,
      assessIncomingNote: async () => {
        assessments.push({ kind: "spendable" });
        return { kind: "spendable" };
      },
      markDeliveryProcessed: async () => undefined,
      persistSpendableCoinToSdk: noopPersist,
    });

    expect(selectCoinItems(store.getState())).toHaveLength(1);
    expect(selectSeamTransactions(store.getState())).toEqual([]);
    expect(assessments).toEqual([]);
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([
      TAG_SPENDABLE,
    ]);
  });

  it("leaves a pending delivery unmarked and finalizes it once spendable", async () => {
    const store = createTestStore();
    const { row, decrypted } = decryptedFor(COMMIT_PENDING, TAG_PENDING, 2);
    let assessment: IncomingNoteAssessment = { kind: "pending" };
    const marked: number[] = [];

    const runPoll = () =>
      processIncomingDeliveryRows({
        rows: [row],
        seenTags: selectSeenTagsForAsset(ASSET_ID)(store.getState()),
        coinItems: selectCoinItems(store.getState()),
        recipientScalarHex: SCALAR,
        privateAddress: PRIVATE_ADDRESS,
        assetId: ASSET_ID,
        poolContract: POOL,
        publicKey: PUBLIC_KEY,
        localTransactionIds: [],
        dispatch: store.dispatch,
        decryptDeliveryRow: async () => decrypted,
        assessIncomingNote: async () => assessment,
        markDeliveryProcessed: async (deliveryId) => {
          marked.push(deliveryId);
        },
        persistSpendableCoinToSdk: noopPersist,
      });

    await runPoll();
    expect(selectCoinItems(store.getState())).toEqual([]);
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([]);
    expect(marked).toEqual([]);
    expect(selectSeamTransactions(store.getState())[0]?.status).toBe("pending");

    assessment = { kind: "spendable" };
    await runPoll();
    const coins = selectCoinItems(store.getState());
    expect(coins).toHaveLength(1);
    expect(coins[0]?.status).toBe("finalized");
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([
      TAG_PENDING,
    ]);
    expect(marked).toEqual([2]);
    expect(selectSeamTransactions(store.getState())[0]?.status).toBe(
      "completed",
    );
  });

  it("stores a dead-on-arrival delivery with its reason and marks the tag seen", async () => {
    const store = createTestStore();
    const { row, decrypted } = decryptedFor(COMMIT_DEAD, TAG_DEAD, 3);
    const marked: number[] = [];

    await processIncomingDeliveryRows({
      rows: [row],
      seenTags: [],
      coinItems: selectCoinItems(store.getState()),
      recipientScalarHex: SCALAR,
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      publicKey: PUBLIC_KEY,
      localTransactionIds: [],
      dispatch: store.dispatch,
      decryptDeliveryRow: async () => decrypted,
      assessIncomingNote: async () => ({
        kind: "dead",
        reason: "nullifier_consumed",
      }),
      markDeliveryProcessed: async (deliveryId) => {
        marked.push(deliveryId);
      },
      persistSpendableCoinToSdk: noopPersist,
    });

    const coins = selectCoinItems(store.getState());
    expect(coins).toHaveLength(1);
    expect(coins[0]?.status).toBe("dead");
    expect(coins[0]?.deadReason).toBe("nullifier_consumed");
    expect(selectSeenTagsForAsset(ASSET_ID)(store.getState())).toEqual([
      TAG_DEAD,
    ]);
    expect(marked).toEqual([3]);
    const transaction = selectSeamTransactions(store.getState())[0];
    expect(transaction?.status).toBe("failed");
    expect(transaction?.invalidIncomingReason).toBe("nullifier_consumed");
  });
});

describe("dead-on-arrival notes excluded from balance and inputs", () => {
  it("does not contribute a dead note to the asset balance or spend inputs", () => {
    const deadCoin: CoinWithMetadata = {
      commitmentHex: COMMIT_DEAD,
      coin: coinData(COMMIT_DEAD),
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      amountDisplay: 1,
      status: "dead",
      deadReason: "commitment_mismatch",
    };
    const spendable: CoinWithMetadata = {
      commitmentHex: COMMIT_SPENDABLE,
      coin: coinData(COMMIT_SPENDABLE),
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      amountDisplay: 1,
      status: "finalized",
    };
    const store = createTestStore([deadCoin, spendable]);
    const aggregates = selectFinalizedAggregatesForPrivateAddress(
      store.getState(),
      PRIVATE_ADDRESS,
    );
    expect(aggregates).toEqual([
      {
        assetId: ASSET_ID,
        poolContract: POOL,
        totalAmountDisplay: 1,
      },
    ]);
    const picked = pickPrivateSpendCoins({
      finalizedCoins: selectCoinItems(store.getState()).filter(
        (item) => item.status === "finalized",
      ),
      spendStroops: BigInt(NOTE_VALUE),
      insufficientBalanceMessage: "insufficient",
    });
    expect(picked.map((item) => item.commitmentHex)).toEqual([
      COMMIT_SPENDABLE,
    ]);
    expect(picked.every((item) => item.status !== "dead")).toBe(true);
  });
});

describe("spent-nullifier poll skips dead-on-arrival notes", () => {
  it("keeps a dead note dead when its nullifier is consumed", async () => {
    const deadCoin: CoinWithMetadata = {
      commitmentHex: COMMIT_DEAD,
      coin: coinData(COMMIT_DEAD),
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      amountDisplay: 1,
      status: "dead",
      deadReason: "nullifier_consumed",
    };
    const store = createTestStore([deadCoin]);
    const checked: string[] = [];

    await pollSpentNullifiersForCoins({
      walletPublicKey: PUBLIC_KEY,
      items: selectCoinItems(store.getState()),
      dispatch: store.dispatch,
      checkSpendStatus: async ({ nullifier }) => {
        checked.push(nullifier);
        return { spent: true };
      },
    });

    expect(checked).toEqual([]);
    expect(selectCoinItems(store.getState())[0]?.status).toBe("dead");
  });
});

describe("commitment mismatch dead-on-arrival delivery", () => {
  it("stores commitment_mismatch reason on the dead note and failed transfer", async () => {
    const store = createTestStore();
    const { row, decrypted } = decryptedFor(COMMIT_DEAD, TAG_DEAD, 4);

    await processIncomingDeliveryRows({
      rows: [row],
      seenTags: [],
      coinItems: [],
      recipientScalarHex: SCALAR,
      privateAddress: PRIVATE_ADDRESS,
      assetId: ASSET_ID,
      poolContract: POOL,
      publicKey: PUBLIC_KEY,
      localTransactionIds: [],
      dispatch: store.dispatch,
      decryptDeliveryRow: async () => decrypted,
      assessIncomingNote: async () => ({
        kind: "dead",
        reason: "commitment_mismatch",
      }),
      markDeliveryProcessed: async () => undefined,
      persistSpendableCoinToSdk: noopPersist,
    });

    expect(selectCoinItems(store.getState())[0]?.deadReason).toBe(
      "commitment_mismatch",
    );
    expect(
      selectSeamTransactions(store.getState())[0]?.invalidIncomingReason,
    ).toBe("commitment_mismatch");
  });
});
