import { getAssetUsdPrice } from "@/entities/asset";
import type { Transaction } from "../model/transaction";

const PENDING_CLAIM_TRANSACTION_ID_PREFIX = "pending-claim-";

function isPendingClaimHistoryTransactionId(transactionId: string): boolean {
  return transactionId.startsWith(PENDING_CLAIM_TRANSACTION_ID_PREFIX);
}

export type TransactionFlowTotals = {
  inflowUsd: number;
  outflowUsd: number;
};

function isIncomingType(type: Transaction["type"]): boolean {
  return type === "received" || type === "deposit" || type === "claim";
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

    if (isPendingClaimHistoryTransactionId(transaction.id)) {
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
