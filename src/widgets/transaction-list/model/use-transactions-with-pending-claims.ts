import { useCallback, useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  assetApi,
  useAssetsWithTrustlines,
  type AssetWithTrustline,
} from "@/entities/asset";
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
  const { assets: assetsWithTrustlines } = useAssetsWithTrustlines(publicKey);

  const resolveAsset = useCallback(
    (tokenAddress: string) =>
      resolveAssetIdFromTokenAddress(tokenAddress, assets),
    [assets],
  );

  const {
    claims,
    isLoading: pendingClaimsLoading,
    reload: reloadPendingClaims,
    removeClaim: removePendingClaim,
  } = useSdkPendingClaimsList(publicKey, resolveAsset);

  const pendingClaimContext = useMemo(() => {
    const claimsById = new Map<number, PendingClaimItem>();
    const assetIdsByClaimId = new Map<number, string>();
    const pendingClaimRows: Transaction[] = [];
    const assetsById = new Map<string, AssetWithTrustline>(
      assetsWithTrustlines.map((asset) => [asset.assetId, asset]),
    );

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
      assetsById,
    };
  }, [assets, assetsWithTrustlines, claims]);

  const mergedTransactions = useMemo(
    () =>
      mergeTransactionsWithPendingClaims({
        transactions,
        pendingClaimRows: pendingClaimContext.pendingClaimRows,
      }),
    [pendingClaimContext.pendingClaimRows, transactions],
  );

  return {
    mergedTransactions,
    pendingClaimsLoading,
    reloadPendingClaims,
    removePendingClaim,
    ...pendingClaimContext,
  };
}
