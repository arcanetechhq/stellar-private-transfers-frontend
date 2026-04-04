import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { shortenStealthForDisplay } from "@/shared/lib/stealth/shorten-stealth-for-display";

const STELLAR_ACCOUNT_OR_CONTRACT_STRKEY_LENGTH = 56;

export function formatSenderCounterpartyForDisplay(address: string): string {
  const trimmed = address.trim();
  if (trimmed === "") {
    return trimmed;
  }
  if (
    trimmed.length === STELLAR_ACCOUNT_OR_CONTRACT_STRKEY_LENGTH &&
    (trimmed.startsWith("G") || trimmed.startsWith("C"))
  ) {
    return shortenStellarAddress(trimmed);
  }
  return shortenStealthForDisplay(trimmed);
}
