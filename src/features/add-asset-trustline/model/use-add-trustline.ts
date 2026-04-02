import { useState, useCallback } from "react";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import { useAppDispatch } from "@/app/hooks";
import { submitHorizonTransaction } from "@/features/stellar-wallet-connect";
import { buildChangeTrustTx } from "@/shared/stellar/build-change-trust-tx";
import { HORIZON_URL, horizonServer } from "@/shared/stellar/horizon-server";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

export function useAddTrustline(
  publicKey: string | undefined,
  onSuccess: () => void,
) {
  const dispatch = useAppDispatch();
  const [pendingAssetId, setPendingAssetId] = useState<string | undefined>();

  const addTrustline = useCallback(
    async (target: TrustlineTarget) => {
      if (!publicKey) return;

      setPendingAssetId(target.assetId);
      try {
        const { networkPassphrase } = await StellarWalletsKitSdk.getNetwork();
        const xdr = await buildChangeTrustTx({
          server: horizonServer,
          publicKey,
          assetCode: target.assetCode,
          issuerAddress: target.issuerAddress,
          networkPassphrase,
        });
        await dispatch(
          submitHorizonTransaction({
            horizonUrl: HORIZON_URL,
            networkPassphrase,
            publicKey,
            xdr,
          }),
        ).unwrap();
        onSuccess();
      } finally {
        setPendingAssetId(undefined);
      }
    },
    [dispatch, onSuccess, publicKey],
  );

  return {
    addTrustline,
    pendingAssetId,
    isSubmitting: pendingAssetId !== undefined,
  };
}
