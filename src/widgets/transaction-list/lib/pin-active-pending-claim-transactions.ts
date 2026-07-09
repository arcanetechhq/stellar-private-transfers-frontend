import { isPendingClaimTransactionId } from "@/entities/pending-claims";
import type { Transaction } from "@/entities/transaction";
import { sortTransactionsByDateDesc } from "@/entities/transaction";

export function isActivePendingClaimTransaction(
  transaction: Transaction,
): boolean {
  return (
    isPendingClaimTransactionId(transaction.id) &&
    transaction.status !== "completed" &&
    transaction.status !== "failed"
  );
}

export function pinActivePendingClaimTransactions(
  transactions: Transaction[],
  sortRest?: (left: Transaction, right: Transaction) => number,
): Transaction[] {
  const activePending = transactions.filter(isActivePendingClaimTransaction);
  const rest = transactions.filter(
    (transaction) => !isActivePendingClaimTransaction(transaction),
  );
  const sortedPending = sortTransactionsByDateDesc(activePending);
  const sortedRest = sortRest
    ? [...rest].toSorted(sortRest)
    : sortTransactionsByDateDesc(rest);
  return [...sortedPending, ...sortedRest];
}
