import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  assetApi,
  claimFinished,
  claimStarted,
  refreshAssetsWithTrustlinesThunk,
} from "@/entities/asset";
import {
  assertFaucetClaimAllowed,
  markFaucetClaimedToday,
} from "../lib/faucet-daily-limit";
import { fundNativeViaFriendbot } from "../lib/fund-native-via-friendbot";

interface ClaimFaucetInput {
  publicKey: string;
  assetId: string;
  ignoreDailyLimit?: boolean;
}

export const claimNativeFaucetThunk = createAsyncThunk<
  void,
  ClaimFaucetInput
>("faucet/claimNative", async (input, { dispatch }) => {
  const { publicKey, assetId, ignoreDailyLimit = false } = input;
  if (!ignoreDailyLimit) {
    assertFaucetClaimAllowed(publicKey, assetId);
  }
  dispatch(claimStarted(assetId));
  try {
    await fundNativeViaFriendbot(publicKey);
    markFaucetClaimedToday(publicKey, assetId);
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(claimFinished(assetId));
  }
});

export const claimIssuedAssetThunk = createAsyncThunk<
  void,
  ClaimFaucetInput
>("faucet/claimIssued", async (input, { dispatch }) => {
  const { publicKey, assetId, ignoreDailyLimit = false } = input;
  if (!ignoreDailyLimit) {
    assertFaucetClaimAllowed(publicKey, assetId);
  }
  dispatch(claimStarted(assetId));
  try {
    await dispatch(
      assetApi.endpoints.mintAsset.initiate({ assetId, address: publicKey }),
    ).unwrap();
    markFaucetClaimedToday(publicKey, assetId);
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(claimFinished(assetId));
  }
});
