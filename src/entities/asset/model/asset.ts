import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AssetId = "usdc" | "eth" | "usdt" | "dai" | "btc" | "paxg";

export interface AssetCatalogItem {
  id: AssetId;
  name: string;
  ticker: string;
}

export interface Asset extends AssetCatalogItem {
  balance: number;
  valueUSD: number;
}

export const ASSET_CATALOG: AssetCatalogItem[] = [
  {
    id: "usdc",
    name: "USD Coin",
    ticker: "USDC",
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
  },
  {
    id: "usdt",
    name: "Tether USD",
    ticker: "USDT",
  },
  {
    id: "dai",
    name: "Dai Stablecoin",
    ticker: "DAI",
  },
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
  },
  {
    id: "paxg",
    name: "Pax Gold",
    ticker: "PAXG",
  },
];

export interface AssetBalanceEntry {
  balance: number;
  valueUSD: number;
}

export interface AssetBalanceState {
  byId: Record<AssetId, AssetBalanceEntry>;
}

const initialById: Record<AssetId, AssetBalanceEntry> = {
  usdc: { balance: 25_430.5, valueUSD: 25_430.5 },
  eth: { balance: 5.742, valueUSD: 18_920.45 },
  usdt: { balance: 8500, valueUSD: 8500 },
  dai: { balance: 3200, valueUSD: 3200 },
  btc: { balance: 0.045, valueUSD: 2890 },
  paxg: { balance: 1.2, valueUSD: 2340 },
};

const initialState: AssetBalanceState = {
  byId: initialById,
};

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    setAssetBalance: (
      state,
      action: PayloadAction<{
        id: AssetId;
        balance: number;
        valueUSD: number;
      }>,
    ) => {
      state.byId[action.payload.id] = {
        balance: action.payload.balance,
        valueUSD: action.payload.valueUSD,
      };
    },
    replaceBalances: (
      state,
      action: PayloadAction<Record<AssetId, AssetBalanceEntry>>,
    ) => {
      state.byId = action.payload;
    },
  },
});

export const { setAssetBalance, replaceBalances } = assetSlice.actions;
export const assetReducer = assetSlice.reducer;

export const selectAssetCatalog = (): AssetCatalogItem[] => ASSET_CATALOG;

export const selectPortfolioAssets = (state: {
  asset: AssetBalanceState;
}): Asset[] => {
  const { byId } = state.asset;
  return ASSET_CATALOG.map((item) => ({
    ...item,
    balance: byId[item.id].balance,
    valueUSD: byId[item.id].valueUSD,
  }));
};

export function selectTotalBalanceUsd(state: {
  asset: AssetBalanceState;
}): number {
  const { byId } = state.asset;
  let sum = 0;
  for (const item of ASSET_CATALOG) {
    sum += byId[item.id].valueUSD;
  }
  return sum;
}

export const selectAssetCount = (): number => ASSET_CATALOG.length;
