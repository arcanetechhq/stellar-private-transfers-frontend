import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import type { AggregatedPrivateAssetRow } from "../model/coin";

type AssetCatalogItem = {
  assetId: string;
};

export function withZeroAmountPrivateAssetRows(
  aggregates: AggregatedPrivateAssetRow[],
  assetCatalog: AssetCatalogItem[] | undefined,
): AggregatedPrivateAssetRow[] {
  const poolContract = getRequiredPrivacyPoolContractId();
  const byAssetId = new Map(
    aggregates.map((aggregate) => [aggregate.assetId, aggregate]),
  );
  if (assetCatalog) {
    for (const asset of assetCatalog) {
      if (byAssetId.has(asset.assetId)) {
        continue;
      }
      byAssetId.set(asset.assetId, {
        assetId: asset.assetId,
        poolContract,
        totalAmountDisplay: 0,
      });
    }
  }
  return [...byAssetId.values()].toSorted((left, right) =>
    left.assetId.localeCompare(right.assetId),
  );
}
