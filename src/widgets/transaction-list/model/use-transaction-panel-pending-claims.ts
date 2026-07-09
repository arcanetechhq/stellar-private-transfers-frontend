import { useCallback } from "react";
import type { Transaction } from "@/entities/transaction";
import { useClaimPendingClaim } from "@/features/claim-pending-claim";
import { useTransactionsWithPendingClaims } from "./use-transactions-with-pending-claims.js";

export function useTransactionPanelPendingClaims(transactions: Transaction[]) {
  const {
    mergedTransactions,
    claimsById,
    assetIdsByClaimId,
    assetsById,
    reloadPendingClaims,
    removePendingClaim,
  } = useTransactionsWithPendingClaims(transactions);

  const {
    claimByTransactionId,
    claimingId,
    claimError,
    canClaim,
  } = useClaimPendingClaim({
    onClaimed: (claimId) => {
      removePendingClaim(claimId);
      void reloadPendingClaims();
    },
  });

  const handleClaim = useCallback(
    (transactionId: string) => {
      claimByTransactionId(
        transactionId,
        claimsById,
        assetsById,
        assetIdsByClaimId,
      );
    },
    [assetIdsByClaimId, assetsById, claimByTransactionId, claimsById],
  );

  return {
    mergedTransactions,
    claimControls: {
      claimingId,
      canClaim,
      onClaim: handleClaim,
      error: claimError,
    },
  };
}
