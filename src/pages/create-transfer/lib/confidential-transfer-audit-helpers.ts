import type { CoinWithMetadata } from "@/entities/coin";

export function stealthAddressesEqual(left: string, right: string): boolean {
  return left.trim() === right.trim();
}

export function toAuditNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} is too large for audit encoding`);
  }
  return Number(value);
}

export function findCommitmentLeafIndex(
  commitments: string[],
  coin: CoinWithMetadata,
): number {
  return commitments.indexOf(coin.coin.commitment);
}
