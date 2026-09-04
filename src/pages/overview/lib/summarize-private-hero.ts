import { getAssetUsdPrice } from "@/entities/asset";

export function summarizePrivateHero(
  items: readonly {
    status: string;
    assetId: string;
    amountDisplay: number;
  }[],
): { privateAssetCount: number; totalUsdBalance: number } {
  const privateAmountByAssetId = new Map<string, number>();
  for (const item of items) {
    if (item.status !== "finalized") {
      continue;
    }
    const current = privateAmountByAssetId.get(item.assetId) ?? 0;
    privateAmountByAssetId.set(item.assetId, current + item.amountDisplay);
  }
  let privateAssetCount = 0;
  let totalUsdBalance = 0;
  for (const [assetId, amount] of privateAmountByAssetId.entries()) {
    if (amount <= 0) {
      continue;
    }
    privateAssetCount += 1;
    totalUsdBalance += amount * getAssetUsdPrice(assetId);
  }
  return { privateAssetCount, totalUsdBalance };
}
