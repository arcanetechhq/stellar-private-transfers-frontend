import { createAsyncThunk } from "@reduxjs/toolkit";
import { assetApi } from "../api/asset-api";
import { bumpAssetTrustlineRefetch } from "./asset-trustline-refresh-slice";

export const refreshAssetsWithTrustlinesThunk = createAsyncThunk(
  "asset/refreshAssetsWithTrustlines",
  async (_argument: undefined, { dispatch }) => {
    dispatch(bumpAssetTrustlineRefetch());
    await dispatch(
      assetApi.util.invalidateTags([{ type: "Asset", id: "LIST" }]),
    );
  },
);
