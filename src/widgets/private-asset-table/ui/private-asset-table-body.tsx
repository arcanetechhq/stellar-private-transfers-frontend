import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { PrivateAssetRow } from "./private-asset-row";

type TranslateAssets = (
  key: string,
  options?: Record<string, string | number>,
) => string;

type PrivateAssetTableBodyProperties = {
  translateAssets: TranslateAssets;
  noncesLength: number;
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, { name: string; logoUrl: string | null }>;
  assetUsdPriceById: Map<string, number>;
};

function PanelEmptyState({ message }: { message: string }) {
  return (
    <div className="asset-balances-panel__empty">
      <p className="asset-balances-panel__empty-text">{message}</p>
    </div>
  );
}

export function PrivateAssetTableBody({
  translateAssets,
  noncesLength,
  aggregates,
  assetMetaById,
  assetUsdPriceById,
}: PrivateAssetTableBodyProperties) {
  if (noncesLength === 0) {
    return (
      <PanelEmptyState
        message={translateAssets("privateAssets.noPrivateAddresses")}
      />
    );
  }
  if (aggregates.length === 0) {
    return (
      <PanelEmptyState message={translateAssets("privateAssets.noCoins")} />
    );
  }
  return (
    <div className="asset-balances-panel__list">
      {aggregates.map((row) => {
        const meta = assetMetaById.get(row.assetId);
        const usdAmount =
          row.totalAmountDisplay * (assetUsdPriceById.get(row.assetId) ?? 1);
        return (
          <PrivateAssetRow
            key={row.assetId}
            row={row}
            assetName={meta?.name ?? row.assetId}
            logoUrl={meta?.logoUrl ?? undefined}
            usdAmount={usdAmount}
          />
        );
      })}
    </div>
  );
}
