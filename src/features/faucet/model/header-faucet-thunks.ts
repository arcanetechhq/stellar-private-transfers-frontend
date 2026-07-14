import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  assetApi,
  claimFinished,
  claimStarted,
  refreshAssetsWithTrustlinesThunk,
} from "@/entities/asset";
import { addAssetTrustlineThunk } from "@/features/add-asset-trustline";
import {
  assertFaucetClaimAllowed,
  markFaucetClaimedToday,
} from "../lib/faucet-daily-limit";
import { fundNativeViaFriendbot } from "../lib/fund-native-via-friendbot";

interface ClaimNativeFaucetInput {
  publicKey: string;
  assetId: string;
  ignoreDailyLimit?: boolean;
}

interface ClaimIssuedFaucetInput {
  publicKey: string;
  assetId: string;
  assetCode: string;
  issuerAddress?: string;
  ensureTrustline?: boolean;
  ignoreDailyLimit?: boolean;
}

export const claimNativeFaucetThunk = createAsyncThunk<
  void,
  ClaimNativeFaucetInput
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
  ClaimIssuedFaucetInput
>("faucet/claimIssued", async (input, { dispatch }) => {
  const {
    publicKey,
    assetId,
    assetCode,
    issuerAddress,
    ensureTrustline = false,
    ignoreDailyLimit = false,
  } = input;
  if (!ignoreDailyLimit) {
    assertFaucetClaimAllowed(publicKey, assetId);
  }
  dispatch(claimStarted(assetId));
  try {
    if (ensureTrustline) {
      if (!issuerAddress) {
        throw new Error("Missing issuer address for trustline");
      }
      await dispatch(
        addAssetTrustlineThunk({
          assetId,
          assetCode,
          issuerAddress,
          publicKey,
          skipRefresh: true,
        }),
      ).unwrap();
    }
    await dispatch(
      assetApi.endpoints.mintAsset.initiate({ assetId, address: publicKey }),
    ).unwrap();
    markFaucetClaimedToday(publicKey, assetId);
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(claimFinished(assetId));
  }
});
