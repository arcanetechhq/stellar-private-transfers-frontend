import type { AppDispatch } from "@/store";
import { markCoinSpent } from "@/entities/coin/model/coin-slice.js";
import type { CoinWithMetadata } from "@/entities/coin/model/coin.js";

export function groupFinalizedCoinsByPool(
  items: CoinWithMetadata[],
): Map<string, CoinWithMetadata[]> {
  const map = new Map<string, CoinWithMetadata[]>();
  for (const item of items) {
    if (item.status !== "finalized") {
      continue;
    }
    const list = map.get(item.poolContract) ?? [];
    list.push(item);
    map.set(item.poolContract, list);
  }
  return map;
}

export async function pollSpentNullifiersForCoins(parameters: {
  walletPublicKey: string;
  items: CoinWithMetadata[];
  dispatch: AppDispatch;
  checkSpendStatus: (input: {
    poolContractId: string;
    nullifier: string;
    walletPublicKey: string;
  }) => Promise<{ spent: boolean }>;
}): Promise<void> {
  const byPool = groupFinalizedCoinsByPool(parameters.items);
  for (const [poolContract, coins] of byPool) {
    for (const coinRow of coins) {
      try {
        const { spent } = await parameters.checkSpendStatus({
          poolContractId: poolContract,
          nullifier: coinRow.coin.nullifier,
          walletPublicKey: parameters.walletPublicKey,
        });
        if (spent) {
          parameters.dispatch(markCoinSpent(coinRow.coin.commitment));
        }
      } catch {
        continue;
      }
    }
  }
}
