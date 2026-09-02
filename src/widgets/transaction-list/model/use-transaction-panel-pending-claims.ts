import { useCallback, useMemo } from "react";
import type { Transaction } from "@/entities/transaction";
import { getPendingClaimTransactionId } from "@/entities/pending-claims";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import { useClaimPendingClaim } from "@/features/claim-pending-claim";
import { useMergedWalletTransactions } from "./use-merged-wallet-transactions.js";

export type PendingAssetClaimListItem = {
  claimId: number;
  transactionId: string;
  assetId: string;
  amountDisplay: number;
};

export function useTransactionPanelPendingClaims(transactions: Transaction[]) {
  const {
    mergedTransactions,
    claimsById,
    assetIdsByClaimId,
    reloadPendingClaims,
    removePendingClaim,
  } = useMergedWalletTransactions(transactions);

  const handleClaimed = useCallback(
    (claimId: number) => {
      removePendingClaim(claimId);
      void reloadPendingClaims();
    },
    [reloadPendingClaims, removePendingClaim],
  );

  const {
    claimByTransactionId,
    claimingId,
    claimError,
    canClaim,
    relayAction,
    handleRetry,
    handleFallback,
  } = useClaimPendingClaim({
    onClaimed: handleClaimed,
  });

  const handleClaim = useCallback(
    (transactionId: string) => {
      claimByTransactionId({
        transactionId,
        claimsById,
        assetIdsByClaimId,
      });
    },
    [assetIdsByClaimId, claimByTransactionId, claimsById],
  );

  const pendingAssetClaims = useMemo(() => {
    const rows: PendingAssetClaimListItem[] = [];
    for (const [claimId, claim] of claimsById.entries()) {
      const assetId = assetIdsByClaimId.get(claimId);
      if (!assetId) {
        continue;
      }
      rows.push({
        claimId,
        transactionId: getPendingClaimTransactionId(claimId),
        assetId,
        amountDisplay: stroopsToDisplayAmount(BigInt(claim.noteValue)),
      });
    }
    return rows.toSorted((left, right) =>
      left.assetId.localeCompare(right.assetId),
    );
  }, [assetIdsByClaimId, claimsById]);

  return {
    mergedTransactions,
    pendingAssetClaims,
    claimControls: {
      claimingId,
      canClaim,
      onClaim: handleClaim,
      error: claimError,
      retryAllowed: relayAction?.retryAllowed,
      fallbackAllowed: relayAction?.fallbackAllowed,
      onRetry: handleRetry,
      onFallback: handleFallback,
    },
  };
}
