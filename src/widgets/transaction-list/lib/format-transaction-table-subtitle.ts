import type { Transaction } from "@/entities/transaction";
import { isPendingClaimTransactionId } from "@/entities/pending-claims";
import {
  formatTransactionPublicAddressForDisplay,
  resolveTransactionPublicAddress,
} from "./format-transaction-public-address-for-display";

function isPrivateTransferTableType(type: Transaction["type"]): boolean {
  return type === "sent" || type === "received";
}

function isPublicAddressTableType(type: Transaction["type"]): boolean {
  return type === "deposit" || type === "withdrawal";
}

export function formatTransactionTableSubtitle(
  transaction: Transaction,
  walletPublicKey: string | undefined,
  options: {
    privateTransferLabel: string;
    pendingSubtitle: string;
    claimCreditLabel: string;
    assetFallback: string;
  },
): string {
  if (isPendingClaimTransactionId(transaction.id)) {
    return options.pendingSubtitle;
  }
  if (transaction.type === "claim") {
    return options.claimCreditLabel;
  }
  if (isPrivateTransferTableType(transaction.type)) {
    return options.privateTransferLabel;
  }
  if (isPublicAddressTableType(transaction.type)) {
    const address = resolveTransactionPublicAddress(
      transaction,
      walletPublicKey,
    );
    if (!address) {
      return options.assetFallback;
    }
    return formatTransactionPublicAddressForDisplay(
      transaction,
      walletPublicKey,
    );
  }
  const address = resolveTransactionPublicAddress(
    transaction,
    walletPublicKey,
  );
  if (!address) {
    return options.assetFallback;
  }
  return formatTransactionPublicAddressForDisplay(
    transaction,
    walletPublicKey,
  );
}

export function transactionTableSubtitleTitle(
  transaction: Transaction,
  walletPublicKey: string | undefined,
): string | undefined {
  if (isPrivateTransferTableType(transaction.type)) {
    return undefined;
  }
  const address = resolveTransactionPublicAddress(
    transaction,
    walletPublicKey,
  );
  return address || undefined;
}
