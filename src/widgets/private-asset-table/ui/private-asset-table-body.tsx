import React from "react";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { PrivateAssetRow } from "./private-asset-row";

type TranslateAssets = (
  key: string,
  options?: Record<string, string | number>,
) => string;

type AssetMeta = { name: string; logoUrl: string | null };

type PrivateAssetTableBodyProperties = {
  translateAssets: TranslateAssets;
  noncesLength: number;
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, AssetMeta>;
  assetUsdPriceById: Map<string, number>;
};

function PanelEmptyState({ message }: { message: string }) {
  return (
    <div className="asset-balances-panel__empty">
      <p className="asset-balances-panel__empty-text">{message}</p>
    </div>
  );
}

function renderAssetRows(parameters: {
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, AssetMeta>;
  assetUsdPriceById: Map<string, number>;
}) {
  return parameters.aggregates.map((row) => {
    const meta = parameters.assetMetaById.get(row.assetId);
    const usdAmount =
      row.totalAmountDisplay *
      (parameters.assetUsdPriceById.get(row.assetId) ?? 1);
    return (
      <PrivateAssetRow
        key={row.assetId}
        row={row}
        assetName={meta?.name ?? row.assetId}
        logoUrl={meta?.logoUrl ?? undefined}
        usdAmount={usdAmount}
      />
    );
  });
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
      {renderAssetRows({
        aggregates,
        assetMetaById,
        assetUsdPriceById,
      })}
    </div>
  );
}
