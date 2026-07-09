import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  isPendingClaimTransactionId,
  parsePendingClaimTransactionId,
} from "@/entities/pending-claims";
import type { Transaction } from "@/entities/transaction";

type TransactionClaimActionCellProperties = {
  transaction: Transaction;
  claimingId: number | undefined;
  canClaim: boolean;
  onClaim: (transactionId: string) => void;
};

export function TransactionClaimActionCell({
  transaction,
  claimingId,
  canClaim,
  onClaim,
}: TransactionClaimActionCellProperties) {
  const { t: translatePendingClaims } = useTranslation("pendingClaims");
  const { t: translateTransactions } = useTranslation("transactions");

  if (
    !canClaim ||
    !isPendingClaimTransactionId(transaction.id) ||
    transaction.status !== "pending"
  ) {
    return null;
  }

  const pendingClaimId = parsePendingClaimTransactionId(transaction.id);
  const isClaiming =
    pendingClaimId !== undefined && claimingId === pendingClaimId;
  const isClaimBusy = claimingId !== undefined;

  return (
    <button
      type="button"
      disabled={isClaimBusy}
      aria-busy={isClaiming}
      className="transaction-claim-action"
      data-variant="primary"
      onClick={(event) => {
        event.stopPropagation();
        if (isClaimBusy) {
          return;
        }
        onClaim(transaction.id);
      }}
    >
      {isClaiming ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          <span>{translatePendingClaims("claiming")}</span>
        </>
      ) : (
        translateTransactions("pendingClaimAction")
      )}
    </button>
  );
}
