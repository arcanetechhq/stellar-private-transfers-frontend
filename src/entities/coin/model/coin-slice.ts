import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AggregatedPrivateAssetRow, CoinWithMetadata } from "./coin";
import { normalizeCommitmentHex } from "../lib/persist-coin";
import {
  findCoinItemByLedgerReference,
  incomingSharesLedgerKeyWithAnyItem,
} from "../lib/ledger-commitment";

export interface CoinState {
  items: CoinWithMetadata[];
  coinsHydrated: boolean;
}

const initialState: CoinState = {
  items: [],
  coinsHydrated: false,
};

function commitmentKey(hex: string): string {
  return normalizeCommitmentHex(hex) ?? hex.trim().toLowerCase();
}

const coinSlice = createSlice({
  name: "coin",
  initialState,
  reducers: {
    hydrateCoinState: (state, action: PayloadAction<CoinWithMetadata[]>) => {
      state.items = action.payload;
      state.coinsHydrated = true;
    },
    addCoin: (state, action: PayloadAction<CoinWithMetadata>) => {
      if (incomingSharesLedgerKeyWithAnyItem(state.items, action.payload)) {
        return;
      }
      const normalized = commitmentKey(action.payload.commitmentHex);
      state.items.push({
        ...action.payload,
        commitmentHex: normalized,
      });
    },
    finalizeCoin: (state, action: PayloadAction<string>) => {
      const item = findCoinItemByLedgerReference(state.items, action.payload);
      if (!item || item.status === "spent") {
        return;
      }
      if (item.status === "pending") {
        item.status = "finalized";
      }
    },
    markCoinSpent: (state, action: PayloadAction<string>) => {
      const item = findCoinItemByLedgerReference(state.items, action.payload);
      if (item?.status === "finalized" || item?.status === "pending") {
        item.status = "spent";
      }
    },
    resetCoinState: () => initialState,
  },
});

export const {
  hydrateCoinState,
  addCoin,
  finalizeCoin,
  markCoinSpent,
  resetCoinState,
} = coinSlice.actions;

export const coinReducer = coinSlice.reducer;

export type CoinRootState = { coin: CoinState };

export const selectCoinItems = (state: CoinRootState): CoinWithMetadata[] =>
  state.coin.items;

export const selectCoinsByPrivateAddress =
  (privateAddress: string | undefined) =>
  (state: CoinRootState): CoinWithMetadata[] => {
    if (!privateAddress) {
      return [];
    }
    return state.coin.items.filter(
      (item) => item.privateAddress === privateAddress,
    );
  };

export const selectPrivateAddressesWithCoins = (
  state: CoinRootState,
): string[] => {
  const unique = new Set<string>();
  for (const item of state.coin.items) {
    unique.add(item.privateAddress);
  }
  return [...unique];
};

const EMPTY_FINALIZED_AGGREGATES: AggregatedPrivateAssetRow[] = [];

export const selectFinalizedAggregatesForPrivateAddress = createSelector(
  [
    selectCoinItems,
    (_state: CoinRootState, privateAddress: string | undefined) =>
      privateAddress?.trim(),
  ],
  (items, privateAddress): AggregatedPrivateAssetRow[] => {
    if (!privateAddress) {
      return EMPTY_FINALIZED_AGGREGATES;
    }
    const finalized = items.filter(
      (item) =>
        item.privateAddress === privateAddress && item.status === "finalized",
    );
    const byAsset = new Map<string, AggregatedPrivateAssetRow>();
    for (const item of finalized) {
      const existing = byAsset.get(item.assetId);
      if (existing) {
        existing.totalAmountDisplay += item.amountDisplay;
      } else {
        byAsset.set(item.assetId, {
          assetId: item.assetId,
          poolContract: item.poolContract,
          totalAmountDisplay: item.amountDisplay,
        });
      }
    }
    return [...byAsset.values()].toSorted((left, right) =>
      left.assetId.localeCompare(right.assetId),
    );
  },
);
