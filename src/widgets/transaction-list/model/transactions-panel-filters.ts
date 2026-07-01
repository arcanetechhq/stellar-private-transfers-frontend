import type { Transaction } from "@/entities/transaction";

export type TransactionPeriod = "last30Days" | "last3Months" | "thisYear";
export type TransactionTypeFilter = "all" | "incoming" | "outgoing";
export type TransactionStatusFilter = "all" | "completed" | "pending";
export type TransactionAssetFilter = "all" | string;
export type TransactionSortKey = "date" | "amount";
export type SortDirection = "asc" | "desc";

export type TransactionSortState = {
  key: TransactionSortKey;
  direction: SortDirection;
};

export type TransactionPanelFilterState = {
  search: string;
  period: TransactionPeriod;
  typeFilter: TransactionTypeFilter;
  assetFilter: TransactionAssetFilter;
  statusFilter: TransactionStatusFilter;
  sort: TransactionSortState;
};

function getPeriodCutoff(period: TransactionPeriod): number {
  const now = new Date();
  if (period === "last30Days") {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    return cutoff.getTime();
  }
  if (period === "thisYear") {
    return new Date(now.getFullYear(), 0, 1).getTime();
  }
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 3);
  return cutoff.getTime();
}

function matchesTransactionType(
  transaction: Transaction,
  typeFilter: TransactionTypeFilter,
): boolean {
  if (typeFilter === "all") {
    return true;
  }
  if (typeFilter === "incoming") {
    return transaction.type === "received" || transaction.type === "deposit";
  }
  return transaction.type === "sent" || transaction.type === "withdrawal";
}

function matchesTransactionStatus(
  transaction: Transaction,
  statusFilter: TransactionStatusFilter,
): boolean {
  if (statusFilter === "all") {
    return true;
  }
  if (statusFilter === "completed") {
    return transaction.status === "completed";
  }
  return (
    transaction.status === "pending" ||
    transaction.status === "processing" ||
    transaction.status === "created"
  );
}

function matchesTransactionSearch(
  transaction: Transaction,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (query === "") {
    return true;
  }
  const haystack = [
    transaction.id,
    transaction.counterparty,
    transaction.assetId,
    transaction.type,
    transaction.status,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function compareTransactions(
  left: Transaction,
  right: Transaction,
  sort: TransactionSortState,
): number {
  const direction = sort.direction === "asc" ? 1 : -1;
  if (sort.key === "amount") {
    return (left.amount - right.amount) * direction;
  }
  return (
    (new Date(left.date).getTime() - new Date(right.date).getTime()) * direction
  );
}

export const TRANSACTIONS_PANEL_PAGE_SIZE = 10;

export function filterTransactions(options: {
  transactions: Transaction[];
  filters: TransactionPanelFilterState;
}): Transaction[] {
  const { transactions, filters } = options;
  const cutoff = getPeriodCutoff(filters.period);

  const filtered = transactions.filter((transaction) => {
    const matchesPeriod = new Date(transaction.date).getTime() >= cutoff;
    return (
      matchesPeriod &&
      matchesTransactionSearch(transaction, filters.search) &&
      matchesTransactionType(transaction, filters.typeFilter) &&
      matchesTransactionStatus(transaction, filters.statusFilter) &&
      (filters.assetFilter === "all" ||
        transaction.assetId.toLowerCase() ===
          filters.assetFilter.toLowerCase())
    );
  });

  return [...filtered].toSorted((left, right) =>
    compareTransactions(left, right, filters.sort),
  );
}

export function paginateTransactions<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTransactionsPageCount(
  totalItems: number,
  pageSize: number,
): number {
  if (totalItems <= pageSize) {
    return 1;
  }
  return Math.ceil(totalItems / pageSize);
}

export function findTransactionPage(
  transactions: Transaction[],
  transactionId: string,
  pageSize: number,
): number | null {
  const trimmedId = transactionId.trim();
  if (!trimmedId) {
    return null;
  }
  const index = transactions.findIndex(
    (transaction) => transaction.id === trimmedId,
  );
  if (index < 0) {
    return null;
  }
  return Math.floor(index / pageSize) + 1;
}

export function countActiveFilters(
  filters: TransactionPanelFilterState,
): number {
  let count = 0;
  if (filters.typeFilter !== "all") {
    count += 1;
  }
  if (filters.assetFilter !== "all") {
    count += 1;
  }
  if (filters.statusFilter !== "all") {
    count += 1;
  }
  if (filters.search.trim() !== "") {
    count += 1;
  }
  if (filters.period !== "last3Months") {
    count += 1;
  }
  return count;
}

export function countPendingTransactions(transactions: Transaction[]): number {
  return transactions.filter(
    (transaction) =>
      transaction.status === "pending" ||
      transaction.status === "processing" ||
      transaction.status === "created",
  ).length;
}

export function collectTransactionAssetIds(
  transactions: Transaction[],
): string[] {
  const assetIds = new Set<string>();
  for (const transaction of transactions) {
    assetIds.add(transaction.assetId);
  }
  return [...assetIds].toSorted((left, right) => left.localeCompare(right));
}
