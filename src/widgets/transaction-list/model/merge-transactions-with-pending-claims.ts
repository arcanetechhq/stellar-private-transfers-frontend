import { isPendingClaimTransactionId } from "@/entities/pending-claims";
import {
  sortTransactionsByDateDesc,
  type Transaction,
} from "@/entities/transaction";

function shouldShowPendingClaimRowFromApi(
  row: Transaction,
  storedByPendingClaimId: ReadonlyMap<string, Transaction>,
): boolean {
  const stored = storedByPendingClaimId.get(row.id);
  if (!stored) {
    return true;
  }
  return stored.status === "pending";
}

export function mergeTransactionsWithPendingClaims(parameters: {
  transactions: Transaction[];
  pendingClaimRows: Transaction[];
}): Transaction[] {
  const storedByPendingClaimId = new Map<string, Transaction>();
  for (const transaction of parameters.transactions) {
    if (isPendingClaimTransactionId(transaction.id)) {
      storedByPendingClaimId.set(transaction.id, transaction);
    }
  }

  const activePendingClaimRows = parameters.pendingClaimRows.filter((row) =>
    shouldShowPendingClaimRowFromApi(row, storedByPendingClaimId),
  );
  const activePendingIds = new Set(
    activePendingClaimRows.map((row) => row.id),
  );
  const storedTransactions = parameters.transactions.filter((transaction) => {
    if (
      isPendingClaimTransactionId(transaction.id) &&
      activePendingIds.has(transaction.id) &&
      transaction.status === "pending"
    ) {
      return false;
    }
    return true;
  });
  return sortTransactionsByDateDesc([
    ...activePendingClaimRows,
    ...storedTransactions,
  ]);
}
