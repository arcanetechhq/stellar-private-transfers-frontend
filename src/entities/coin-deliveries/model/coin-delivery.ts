import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SeenTagsByAssetId } from "../lib/persist-seen-tags";

export interface CoinDeliveryState {
  tagsByAssetId: SeenTagsByAssetId;
  tagsHydrated: boolean;
}

const initialState: CoinDeliveryState = {
  tagsByAssetId: {},
  tagsHydrated: false,
};

const coinDeliverySlice = createSlice({
  name: "coinDelivery",
  initialState,
  reducers: {
    hydrateSeenTags: (state, action: PayloadAction<SeenTagsByAssetId>) => {
      state.tagsByAssetId = action.payload;
      state.tagsHydrated = true;
    },
    addSeenTag: (
      state,
      action: PayloadAction<{ assetId: string; tagBase64: string }>,
    ) => {
      const { assetId, tagBase64 } = action.payload;
      const tag = tagBase64.trim();
      if (!tag) return;
      const existing = state.tagsByAssetId[assetId] ?? [];
      if (existing.includes(tag)) return;
      state.tagsByAssetId[assetId] = [...existing, tag];
    },
    resetSeenTags: () => initialState,
  },
});

export const { hydrateSeenTags, addSeenTag, resetSeenTags } =
  coinDeliverySlice.actions;

export const coinDeliveryReducer = coinDeliverySlice.reducer;

export type CoinDeliveryRootState = { coinDelivery: CoinDeliveryState };

const emptySeenTagsForAsset: string[] = [];

export const selectSeenTagsForAsset =
  (assetId: string) =>
  (state: CoinDeliveryRootState): string[] =>
    state.coinDelivery.tagsByAssetId[assetId] ?? emptySeenTagsForAsset;

export const selectAllSeenTags = (
  state: CoinDeliveryRootState,
): SeenTagsByAssetId => state.coinDelivery.tagsByAssetId;

export const selectIsTagsHydrated = (state: CoinDeliveryRootState): boolean =>
  state.coinDelivery.tagsHydrated;
