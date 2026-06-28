import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addAssetTrustlineThunk,
  selectTrustlinePendingAssetId,
} from "@/entities/asset";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

export function useAddTrustline(publicKey: string | undefined) {
  const dispatch = useAppDispatch();
  const pendingAssetId = useAppSelector(selectTrustlinePendingAssetId);

  const addTrustline = useCallback(
    (target: TrustlineTarget) => {
      if (!publicKey) {
        return;
      }
      void dispatch(
        addAssetTrustlineThunk({
          ...target,
          publicKey,
        }),
      );
    },
    [dispatch, publicKey],
  );

  return {
    addTrustline,
    pendingAssetId,
    isSubmitting: pendingAssetId !== undefined,
  };
}
