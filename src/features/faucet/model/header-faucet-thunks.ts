import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  assetApi,
  claimFinished,
  claimStarted,
  refreshAssetsWithTrustlinesThunk,
} from "@/entities/asset";

const FRIENDBOT_URL = "https://friendbot.stellar.org";

export const claimNativeFaucetThunk = createAsyncThunk<
  void,
  { publicKey: string; assetId: string }
>("faucet/claimNative", async ({ publicKey, assetId }, { dispatch }) => {
  dispatch(claimStarted(assetId));
  try {
    const url = `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Friendbot error: ${String(response.status)}`);
    }
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(claimFinished(assetId));
  }
});

export const claimIssuedAssetThunk = createAsyncThunk<
  void,
  { publicKey: string; assetId: string }
>("faucet/claimIssued", async ({ publicKey, assetId }, { dispatch }) => {
  dispatch(claimStarted(assetId));
  try {
    await dispatch(
      assetApi.endpoints.mintAsset.initiate({ assetId, address: publicKey }),
    ).unwrap();
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(claimFinished(assetId));
  }
});
