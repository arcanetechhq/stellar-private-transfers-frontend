import React, { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice, useGetAssetsQuery } from "@/entities/asset";
import { selectFinalizedAggregatesForStealth } from "@/entities/coin";
import {
  selectDefaultNonce,
  selectStealthByNonce,
} from "@/entities/stealth-address";
import {
  PrivateAssetTableBody,
  PRIVATE_ASSET_TITLE_CLASS,
} from "./private-asset-table-body";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

type PrivateAssetTableProperties = {
  postAddressPicker?: ReactNode;
};

export function PrivateAssetTable({
  postAddressPicker,
}: PrivateAssetTableProperties) {
  const { t: translateAssets } = useTranslation("assets");
  const { t: translateOverview } = useTranslation("overview");
  const defaultNonce = useAppSelector(selectDefaultNonce);
  const selectedStealthAddress = useAppSelector(
    selectStealthByNonce(defaultNonce ?? ""),
  );
  const aggregates = useAppSelector(
    selectFinalizedAggregatesForStealth(
      selectedStealthAddress?.stealthAddress ?? undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();

  const aggregatesWithZeroAssets = useMemo(() => {
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
  }, [aggregates, assetCatalog]);

  const assetMetaById = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    if (!assetCatalog) {
      return map;
    }
    for (const dto of assetCatalog) {
      map.set(dto.assetId, { name: dto.name, logoUrl: dto.logoUrl });
    }
    return map;
  }, [assetCatalog]);

  const assetUsdPriceById = useMemo(() => {
    const map = new Map<string, number>();
    if (!assetCatalog) {
      return map;
    }
    for (const dto of assetCatalog) {
      map.set(dto.assetId, getAssetUsdPrice(dto.assetId));
    }
    return map;
  }, [assetCatalog]);

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <h2 className={PRIVATE_ASSET_TITLE_CLASS}>
          {translateOverview("privateAssetsTitle")}
        </h2>
        <div className="flex min-w-sm flex-row flex-nowrap items-start justify-end gap-3">
          <div className="max-w-xs min-w-0 flex-3 shrink" />
          {postAddressPicker ? (
            <div className="flex-2 shrink-0">{postAddressPicker}</div>
          ) : undefined}
        </div>
      </div>
      <PrivateAssetTableBody
        translateAssets={translateAssets}
        noncesLength={selectedStealthAddress ? 1 : 0}
        aggregates={aggregatesWithZeroAssets}
        assetMetaById={assetMetaById}
        assetUsdPriceById={assetUsdPriceById}
      />
    </div>
  );
}
