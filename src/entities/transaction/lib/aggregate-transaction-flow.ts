import { getAssetUsdPrice } from "@/entities/asset";
import type { Transaction } from "../model/transaction";

export type TransactionFlowTotals = {
  inflowUsd: number;
  outflowUsd: number;
};

function isIncomingType(type: Transaction["type"]): boolean {
  return type === "received" || type === "deposit";
}

function isOutgoingType(type: Transaction["type"]): boolean {
  return type === "sent" || type === "withdrawal";
}

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

export function aggregateTransactionFlow(
  transactions: Transaction[],
): TransactionFlowTotals {
  let inflowUsd = 0;
  let outflowUsd = 0;

  for (const transaction of transactions) {
    if (isPendingStatus(transaction.status) || transaction.status === "failed") {
      continue;
    }

    const usdAmount = toUsdAmount(transaction);

    if (isIncomingType(transaction.type)) {
      inflowUsd += usdAmount;
    }

    if (isOutgoingType(transaction.type)) {
      outflowUsd += usdAmount;
    }
  }

  return { inflowUsd, outflowUsd };
}
