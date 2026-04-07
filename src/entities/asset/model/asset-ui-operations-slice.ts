import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AssetUiOperationsState {
  trustlinePendingAssetId: string | undefined;
  claimLoadingByAssetId: Record<string, true>;
}

const initialState: AssetUiOperationsState = {
  trustlinePendingAssetId: undefined,
  claimLoadingByAssetId: {},
};

const assetUiOperationsSlice = createSlice({
  name: "assetUiOperations",
  initialState,
  reducers: {
    trustlineSubmitStarted(state, action: PayloadAction<string>) {
      state.trustlinePendingAssetId = action.payload;
    },
    trustlineSubmitFinished(state) {
      state.trustlinePendingAssetId = undefined;
    },
    claimStarted(state, action: PayloadAction<string>) {
      state.claimLoadingByAssetId[action.payload] = true;
    },
    claimFinished(state, action: PayloadAction<string>) {
      delete state.claimLoadingByAssetId[action.payload];
    },
  },
});

export const {
  trustlineSubmitStarted,
  trustlineSubmitFinished,
  claimStarted,
  claimFinished,
} = assetUiOperationsSlice.actions;

export const assetUiOperationsReducer = assetUiOperationsSlice.reducer;

export const selectTrustlinePendingAssetId = (state: {
  assetUiOperations: AssetUiOperationsState;
}) => state.assetUiOperations.trustlinePendingAssetId;

export function selectIsClaimLoadingForAsset(
  state: { assetUiOperations: AssetUiOperationsState },
  assetId: string,
): boolean {
  return state.assetUiOperations.claimLoadingByAssetId[assetId] === true;
}
