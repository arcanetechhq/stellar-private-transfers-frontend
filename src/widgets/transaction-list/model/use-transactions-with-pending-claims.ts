import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "@/store";
import { assetApi } from "@/entities/asset";
import {
  mapPendingClaimToTransaction,
  resolveAssetIdFromTokenAddress,
  resolvePendingClaimAssetId,
  useSdkPendingClaimsList,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import type { Transaction } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
import { mergeTransactionsWithPendingClaims } from "./merge-transactions-with-pending-claims.js";

export function useTransactionsWithPendingClaims(transactions: Transaction[]) {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { data: assets } = assetApi.useGetAssetsQuery();
  const assetsReference = useRef(assets);
  assetsReference.current = assets;
  const hasSyncedWithAssetsReference = useRef(false);

  const resolveAsset = useCallback(
    (tokenAddress: string) =>
      resolveAssetIdFromTokenAddress(tokenAddress, assetsReference.current),
    [],
  );

  const {
    claims,
    isLoading: pendingClaimsLoading,
    reload: reloadPendingClaims,
    removeClaim: removePendingClaim,
  } = useSdkPendingClaimsList(publicKey, resolveAsset);

  useEffect(() => {
    if (!assets?.length) {
      hasSyncedWithAssetsReference.current = false;
      return;
    }
    if (hasSyncedWithAssetsReference.current) {
      return;
    }
    hasSyncedWithAssetsReference.current = true;
    void reloadPendingClaims({ silent: true });
  }, [assets, reloadPendingClaims]);

  const pendingClaimContext = useMemo(() => {
    const claimsById = new Map<number, PendingClaimItem>();
    const assetIdsByClaimId = new Map<number, string>();
    const pendingClaimRows: Transaction[] = [];

    for (const claim of claims) {
      const assetId = resolvePendingClaimAssetId(claim, assets);
      if (!assetId) {
        continue;
      }
      claimsById.set(claim.id, claim);
      assetIdsByClaimId.set(claim.id, assetId);
      pendingClaimRows.push(
        mapPendingClaimToTransaction({ claim, assetId }),
      );
    }

    return {
      claimsById,
      assetIdsByClaimId,
      pendingClaimRows,
    };
  }, [assets, claims]);

  const mergedTransactionsReference = useRef<Transaction[]>([]);
  const mergedTransactions = useMemo(() => {
    const next = mergeTransactionsWithPendingClaims({
      transactions,
      pendingClaimRows: pendingClaimContext.pendingClaimRows,
    });
    const previous = mergedTransactionsReference.current;
    if (
      previous.length === next.length &&
      previous.every((transaction, index) => {
        const candidate = next[index];
        return (
          candidate !== undefined &&
          transaction.id === candidate.id &&
          transaction.status === candidate.status &&
          transaction.amount === candidate.amount &&
          transaction.date === candidate.date &&
          transaction.assetId === candidate.assetId &&
          transaction.type === candidate.type &&
          transaction.counterparty === candidate.counterparty
        );
      })
    ) {
      return previous;
    }
    mergedTransactionsReference.current = next;
    return next;
  }, [pendingClaimContext.pendingClaimRows, transactions]);

  return {
    mergedTransactions,
    pendingClaimsLoading,
    reloadPendingClaims,
    removePendingClaim,
    ...pendingClaimContext,
  };
}
