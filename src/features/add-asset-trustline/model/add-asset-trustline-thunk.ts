import { createAsyncThunk } from "@reduxjs/toolkit";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  refreshAssetsWithTrustlinesThunk,
  trustlineSubmitFinished,
  trustlineSubmitStarted,
} from "@/entities/asset";
import { submitHorizonTransactionWithWallet } from "@/shared/lib/stellar/submit-horizon-transaction-with-wallet";
import { buildChangeTrustTx } from "@/shared/stellar/build-change-trust-tx";
import { HORIZON_URL, horizonServer } from "@/shared/stellar/horizon-server";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

export interface AddAssetTrustlineThunkPayload extends TrustlineTarget {
  publicKey: string;
}

export const addAssetTrustlineThunk = createAsyncThunk<
  void,
  AddAssetTrustlineThunkPayload
>("addAssetTrustline/submit", async (target, { dispatch }) => {
  dispatch(trustlineSubmitStarted(target.assetId));
  try {
    const { networkPassphrase } = await StellarWalletsKitSdk.getNetwork();
    const xdr = await buildChangeTrustTx({
      server: horizonServer,
      publicKey: target.publicKey,
      assetCode: target.assetCode,
      issuerAddress: target.issuerAddress,
      networkPassphrase,
    });
    await submitHorizonTransactionWithWallet({
      horizonUrl: HORIZON_URL,
      networkPassphrase,
      publicKey: target.publicKey,
      xdr,
    });
    await dispatch(refreshAssetsWithTrustlinesThunk()).unwrap();
  } finally {
    dispatch(trustlineSubmitFinished());
  }
});
