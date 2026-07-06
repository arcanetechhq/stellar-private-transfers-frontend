import type { Transaction } from "@/entities/transaction";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

export function resolveTransactionPublicAddress(
  transaction: Transaction,
  walletPublicKey: string | undefined,
): string {
  const counterparty = transaction.counterparty.trim();
  if (counterparty && isValidStellarPublicAddress(counterparty)) {
    return counterparty;
  }
  return walletPublicKey?.trim() ?? "";
}

export function formatTransactionPublicAddressForDisplay(
  transaction: Transaction,
  walletPublicKey: string | undefined,
): string {
  const address = resolveTransactionPublicAddress(
    transaction,
    walletPublicKey,
  );
  if (!address) {
    return "—";
  }
  return shortenStellarAddress(address);
}
