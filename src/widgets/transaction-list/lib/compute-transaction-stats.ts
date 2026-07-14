import type { Transaction } from "@/entities/transaction";
import { aggregateTransactionFlow } from "@/entities/transaction";
import { getAssetUsdPrice } from "@/entities/asset";
import {
  filterTransactions,
  type TransactionPanelFilterState,
} from "../model/transactions-panel-filters";

export type TransactionStatTone = "positive" | "danger" | "warning";

export type TransactionStatItem = {
  id: "inflow" | "outflow" | "pending";
  valueUsd: number;
  pendingCount?: number;
  tone: TransactionStatTone;
};

function isPendingStatus(status: Transaction["status"]): boolean {
  return (
    status === "pending" ||
    status === "processing" ||
    status === "created"
  );
}

function toUsdAmount(transaction: Transaction): number {
  return transaction.amount * getAssetUsdPrice(transaction.assetId);
}

export function computeTransactionStats(options: {
  transactions: Transaction[];
  filters: TransactionPanelFilterState;
}): TransactionStatItem[] {
  const { transactions, filters } = options;
  const scopedTransactions = filterTransactions({
    transactions,
    filters: { ...filters, search: "" },
  });

  let inflowUsd = 0;
  let outflowUsd = 0;
  let pendingUsd = 0;
  let pendingCount = 0;

  for (const transaction of scopedTransactions) {
    if (isPendingStatus(transaction.status)) {
      pendingUsd += toUsdAmount(transaction);
      pendingCount += 1;
    }
  }

  const completedTransactions = scopedTransactions.filter(
    (transaction) =>
      !isPendingStatus(transaction.status) &&
      transaction.status !== "failed",
  );
  const flowTotals = aggregateTransactionFlow(completedTransactions);
  inflowUsd = flowTotals.inflowUsd;
  outflowUsd = flowTotals.outflowUsd;

  return [
    {
      id: "inflow",
      valueUsd: inflowUsd,
      tone: "positive",
    },
    {
      id: "outflow",
      valueUsd: outflowUsd,
      tone: "danger",
    },
    // {
    //   id: "pending",
    //   valueUsd: pendingUsd,
    //   pendingCount,
    //   tone: "warning",
    // },
  ];
}

export function formatTransactionStatUsd(valueUsd: number): string {
  return valueUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
