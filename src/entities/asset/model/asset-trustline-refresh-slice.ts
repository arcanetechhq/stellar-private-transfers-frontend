import { createSlice } from "@reduxjs/toolkit";

export interface AssetTrustlineRefreshState {
  generation: number;
}

const initialState: AssetTrustlineRefreshState = {
  generation: 0,
};

const assetTrustlineRefreshSlice = createSlice({
  name: "assetTrustlineRefresh",
  initialState,
  reducers: {
    bumpAssetTrustlineRefetch(state) {
      state.generation += 1;
    },
  },
});

export const { bumpAssetTrustlineRefetch } = assetTrustlineRefreshSlice.actions;

export const assetTrustlineRefreshReducer = assetTrustlineRefreshSlice.reducer;

export const selectAssetTrustlineRefreshGeneration = (state: {
  assetTrustlineRefresh: AssetTrustlineRefreshState;
}) => state.assetTrustlineRefresh.generation;
