import type { AssetDto, AssetWithTrustline } from "@/entities/asset";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";

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
  const rows: AssetWithTrustline[] = [];
  for (const row of aggregates) {
    if (row.totalAmountDisplay <= 0) {
      continue;
    }
    const dto = assetCatalog.find((asset) => asset.assetId === row.assetId);
    if (!dto) {
      continue;
    }
    rows.push({
      ...dto,
      poolContract: row.poolContract,
      trustlineStatus: "exists",
      balance: privateBalanceToDisplayString(row.totalAmountDisplay),
    });
  }
  return rows.toSorted((left, right) =>
    left.assetId.localeCompare(right.assetId),
  );
}
