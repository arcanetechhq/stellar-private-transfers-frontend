import React from "react";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { PrivateAssetRow } from "./private-asset-row";

type TranslateAssets = (key: string) => string;

const HEADER_ASSET =
  "col-span-4 text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase";

const HEADER_BALANCE =
  "col-span-3 text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase";

const HEADER_USD =
  "col-span-2 text-right text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase";

const HEADER_ACTIONS =
  "col-span-3 text-right text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase";

type PrivateAssetTableBodyProperties = {
  translateAssets: TranslateAssets;
  noncesLength: number;
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, { name: string; logoUrl: string | null }>;
  assetUsdPriceById: Map<string, number>;
};

function NoStealthMessage({
  translateAssets,
}: {
  translateAssets: TranslateAssets;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] leading-[22px] text-[var(--muted-foreground)]">
        {translateAssets("privateAssets.noStealthAddresses")}
      </p>
    </div>
  );
}

function NoCoinsMessage({
  translateAssets,
}: {
  translateAssets: TranslateAssets;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] leading-[22px] text-[var(--muted-foreground)]">
        {translateAssets("privateAssets.noCoins")}
      </p>
    </div>
  );
}

function AggregatedTableSection({
  translateAssets,
  aggregates,
  assetMetaById,
  assetUsdPriceById,
}: {
  translateAssets: TranslateAssets;
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, { name: string; logoUrl: string | null }>;
  assetUsdPriceById: Map<string, number>;
}) {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 border-b border-[var(--border)] px-6 py-3">
        <div className={HEADER_ASSET}>
          {translateAssets("tableHeaders.asset")}
        </div>
        <div className={HEADER_BALANCE}>
          {translateAssets("tableHeaders.balance")}
        </div>
        <div className={HEADER_USD}>{translateAssets("tableHeaders.usd")}</div>
        <div className={HEADER_ACTIONS}>
          {translateAssets("tableHeaders.actions")}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
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
    </>
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
    return <NoStealthMessage translateAssets={translateAssets} />;
  }
  if (aggregates.length === 0) {
    return <NoCoinsMessage translateAssets={translateAssets} />;
  }
  return (
    <AggregatedTableSection
      translateAssets={translateAssets}
      aggregates={aggregates}
      assetMetaById={assetMetaById}
      assetUsdPriceById={assetUsdPriceById}
    />
  );
}

export const PRIVATE_ASSET_TITLE_CLASS =
  "text-[16px] leading-[24px] font-semibold text-[var(--foreground-primary)]";
