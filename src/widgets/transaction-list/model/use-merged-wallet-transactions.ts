import { useMemo } from "react";
import {
  mapEscrowIndexRowToTransaction,
  mergeTransactionsWithEscrowNotes,
} from "@/entities/escrow-index";
import type { Transaction } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useDiscoverEscrowNotes } from "@/features/discover-escrow-notes";
import { useAppSelector } from "@/store";
import { useTransactionsWithPendingClaims } from "./use-transactions-with-pending-claims.js";

export function useMergedWalletTransactions(transactions: Transaction[]) {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const pending = useTransactionsWithPendingClaims(transactions);
  const { notes } = useDiscoverEscrowNotes(publicKey);
  const escrowRows = useMemo(() => {
    const recipientAddress = publicKey?.trim();
    if (!recipientAddress) {
      return [];
    }
    return notes.map((note) =>
      mapEscrowIndexRowToTransaction({ note, recipientAddress }),
    );
  }, [notes, publicKey]);
  const mergedTransactions = useMemo(
    () =>
      mergeTransactionsWithEscrowNotes({
        transactions: pending.mergedTransactions,
        escrowRows,
      }),
    [escrowRows, pending.mergedTransactions],
  );
  return {
    ...pending,
    mergedTransactions,
  };
}
