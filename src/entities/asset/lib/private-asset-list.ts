import type { AssetDto, AssetWithTrustline } from "../model/asset";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { getAssetUsdPrice, initializeAssetUsdPrices } from "./asset-usd-price";

function privateBalanceToDisplayString(value: number): string {
  if (value === 0) {
    return "0";
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function buildPrivateTransferAssets(
  aggregates: AggregatedPrivateAssetRow[],
  assetCatalog: AssetDto[] | undefined,
): AssetWithTrustline[] {
  if (!assetCatalog) {
    return [];
  }
  initializeAssetUsdPrices(assetCatalog.map((asset) => asset.assetId));
  const rows: AssetWithTrustline[] = [];
  for (const row of aggregates) {
    const dto = assetCatalog.find((asset) => asset.assetId === row.assetId);
    if (!dto) {
      continue;
    }
    rows.push({
      ...dto,
      poolContract: row.poolContract,
      trustlineStatus: "exists",
      balance: privateBalanceToDisplayString(row.totalAmountDisplay),
      usdPrice: getAssetUsdPrice(dto.assetId),
    });
  }
  return rows.toSorted((left, right) =>
    left.assetId.localeCompare(right.assetId),
  );
}
