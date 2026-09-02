import { useMemo } from "react";
import {
  mapEscrowIndexRowToTransaction,
  mergeTransactionsWithEscrowNotes,
} from "@/entities/escrow-index";
import type { Transaction } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useDiscoverEscrowNotes } from "@/features/discover-escrow-notes";
import { useClaimEscrowNotes } from "@/features/claim-escrow-notes";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { useAppSelector } from "@/store";

export function useMergedWalletTransactions(transactions: Transaction[]) {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { notes } = useDiscoverEscrowNotes(publicKey);
  const { ensureWalletPrivateAddress, ensureWalletScalar } =
    useWalletPrivateAddress();
  useClaimEscrowNotes({
    notes,
    walletPublicKey: publicKey,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
  });
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
        transactions,
        escrowRows,
      }),
    [escrowRows, transactions],
  );
  return { mergedTransactions };
}
