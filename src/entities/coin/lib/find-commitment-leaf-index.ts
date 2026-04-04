import type { CoinWithMetadata } from "../model/coin";

export function findCommitmentLeafIndex(
  commitments: string[],
  coin: CoinWithMetadata,
): number {
  return commitments.indexOf(coin.coin.commitment);
}
