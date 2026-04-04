import type { Transaction } from "../model/transaction";

export function sortTransactionsByDateDesc(
  items: readonly Transaction[],
): Transaction[] {
  return [...items].toSorted(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}
