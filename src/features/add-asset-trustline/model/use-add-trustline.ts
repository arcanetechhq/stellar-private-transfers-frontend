import { useState, useCallback } from "react";
import { buildChangeTrustTx } from "@/shared/stellar/build-change-trust-tx";
import { useStellar } from "@/shared/stellar/stellar-context";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

export function useAddTrustline(
  publicKey: string | undefined,
  onSuccess: () => void,
) {
  const { server, signAndSubmitTransaction } = useStellar();
  const [pendingAssetId, setPendingAssetId] = useState<string | undefined>();

  const addTrustline = useCallback(
    async (target: TrustlineTarget) => {
      if (!publicKey) return;

      setPendingAssetId(target.assetId);
      try {
        const xdr = await buildChangeTrustTx({
          server,
          publicKey,
          assetCode: target.assetCode,
          issuerAddress: target.issuerAddress,
        });
        await signAndSubmitTransaction(xdr, publicKey);
        onSuccess();
      } finally {
        setPendingAssetId(undefined);
      }
    },
    [publicKey, server, signAndSubmitTransaction, onSuccess],
  );

  return {
    addTrustline,
    pendingAssetId,
    isSubmitting: pendingAssetId !== undefined,
  };
}
