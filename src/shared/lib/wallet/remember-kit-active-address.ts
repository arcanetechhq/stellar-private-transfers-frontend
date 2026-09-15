import {
  activeAddress,
  addressUpdatedEvent,
} from "@creit-tech/stellar-wallets-kit/state";

export function rememberKitActiveAddress(address: string): void {
  const trimmed = address.trim();
  if (!trimmed) {
    return;
  }
  if (activeAddress.value === trimmed) {
    return;
  }
  activeAddress.value = trimmed;
  addressUpdatedEvent.next(trimmed);
}
