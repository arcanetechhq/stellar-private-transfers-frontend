import type { CoinWithMetadata } from "../model/coin";
import { normalizeCommitmentHex } from "./persist-coin";

function commitmentKey(hex: string): string {
  return normalizeCommitmentHex(hex) ?? hex.trim().toLowerCase();
}

export function ledgerCommitmentKeySet(entry: CoinWithMetadata): Set<string> {
  const keys = new Set<string>();
  const fromMetadata = commitmentKey(entry.commitmentHex);
  if (fromMetadata) {
    keys.add(fromMetadata);
  }
  const fromCoin = commitmentKey(entry.coin.commitment);
  if (fromCoin) {
    keys.add(fromCoin);
  }
  return keys;
}

export function findCoinItemByLedgerReference(
  items: CoinWithMetadata[],
  reference: string,
): CoinWithMetadata | undefined {
  const needle = commitmentKey(reference);
  if (!needle) {
    return undefined;
  }
  return items.find((entry) => ledgerCommitmentKeySet(entry).has(needle));
}

export function incomingSharesLedgerKeyWithAnyItem(
  items: CoinWithMetadata[],
  payload: CoinWithMetadata,
): boolean {
  const incomingKeys = ledgerCommitmentKeySet(payload);
  return items.some((item) => {
    const existingKeys = ledgerCommitmentKeySet(item);
    for (const key of incomingKeys) {
      if (existingKeys.has(key)) {
        return true;
      }
    }
    return false;
  });
}

export function existingSpentCoinMatchesIncomingDelivery(
  items: CoinWithMetadata[],
  parameters: {
    commitmentHex: string;
    coinCommitment: string;
  },
): boolean {
  const incomingKeys = new Set<string>();
  const keyMeta = commitmentKey(parameters.commitmentHex);
  const keyCoin = commitmentKey(parameters.coinCommitment);
  if (keyMeta) {
    incomingKeys.add(keyMeta);
  }
  if (keyCoin) {
    incomingKeys.add(keyCoin);
  }
  return items.some((item) => {
    if (item.status !== "spent" && item.status !== "dead") {
      return false;
    }
    const existingKeys = ledgerCommitmentKeySet(item);
    for (const key of incomingKeys) {
      if (existingKeys.has(key)) {
        return true;
      }
    }
    return false;
  });
}
