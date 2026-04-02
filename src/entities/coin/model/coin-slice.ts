import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AggregatedPrivateAssetRow, CoinWithMetadata } from "./coin";
import { normalizeCommitmentHex } from "../lib/persist-coin";

export interface CoinState {
  items: CoinWithMetadata[];
}

const initialState: CoinState = {
  items: [],
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
    },
    addCoin: (state, action: PayloadAction<CoinWithMetadata>) => {
      const normalized = commitmentKey(action.payload.commitmentHex);
      const exists = state.items.some(
        (item) => commitmentKey(item.commitmentHex) === normalized,
      );
      if (exists) {
        return;
      }
      state.items.push({
        ...action.payload,
        commitmentHex: normalized,
      });
    },
    finalizeCoin: (state, action: PayloadAction<string>) => {
      const key = commitmentKey(action.payload);
      const item = state.items.find((entry) => commitmentKey(entry.commitmentHex) === key);
      if (item?.status === "pending") {
        item.status = "finalized";
      }
    },
    markCoinSpent: (state, action: PayloadAction<string>) => {
      const key = commitmentKey(action.payload);
      const item = state.items.find((entry) => commitmentKey(entry.commitmentHex) === key);
      if (item?.status === "finalized") {
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

export const selectCoinsByStealthAddress =
  (stealthAddress: string | undefined) =>
  (state: CoinRootState): CoinWithMetadata[] => {
    if (!stealthAddress) {
      return [];
    }
    return state.coin.items.filter((item) => item.stealthAddress === stealthAddress);
  };

export const selectStealthAddressesWithCoins = (state: CoinRootState): string[] => {
  const unique = new Set<string>();
  for (const item of state.coin.items) {
    unique.add(item.stealthAddress);
  }
  return [...unique];
};

export const selectFinalizedAggregatesForStealth =
  (stealthAddress: string | undefined) =>
  (state: CoinRootState): AggregatedPrivateAssetRow[] => {
    if (!stealthAddress) {
      return [];
    }
    const finalized = state.coin.items.filter(
      (item) => item.stealthAddress === stealthAddress && item.status === "finalized",
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
  };
