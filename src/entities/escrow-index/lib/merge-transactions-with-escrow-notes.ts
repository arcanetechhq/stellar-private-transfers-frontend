import type { Transaction } from "@/entities/transaction/model/transaction";

function sortEscrowHistoryByDateDesc(
  items: readonly Transaction[],
): Transaction[] {
  return [...items].toSorted(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function mergeTransactionsWithEscrowNotes(input: {
  transactions: Transaction[];
  escrowRows: Transaction[];
}): Transaction[] {
  const existingIds = new Set(
    input.transactions.map((transaction) => transaction.id),
  );
  const extra = input.escrowRows.filter((row) => !existingIds.has(row.id));
  return sortEscrowHistoryByDateDesc([...extra, ...input.transactions]);
}
