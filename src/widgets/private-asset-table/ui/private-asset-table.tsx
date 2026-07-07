import React, { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice, useGetAssetsQuery } from "@/entities/asset";
import {
  selectFirstPrivateAddressWithFinalizedCoins,
  selectFinalizedAggregatesForPrivateAddress,
  withZeroAmountPrivateAssetRows,
} from "@/entities/coin";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import {
  PrivateAssetTableBody,
  PRIVATE_ASSET_TITLE_CLASS,
} from "./private-asset-table-body";

type PrivateAssetTableProperties = {
  postAddressPicker?: ReactNode;
};

function PrivateAssetTableHeader({
  postAddressPicker,
  title,
}: {
  postAddressPicker: ReactNode | undefined;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
      <h2 className={PRIVATE_ASSET_TITLE_CLASS}>{title}</h2>
      <div className="flex min-w-sm flex-row flex-nowrap items-start justify-end gap-3">
        <div className="max-w-xs min-w-0 flex-3 shrink" />
        {postAddressPicker ? (
          <div className="flex-2 shrink-0">{postAddressPicker}</div>
        ) : undefined}
      </div>
    </div>
  );
}

export function PrivateAssetTable({
  postAddressPicker,
}: PrivateAssetTableProperties) {
  const { t: translateAssets } = useTranslation("assets");
  const { t: translateOverview } = useTranslation("overview");
  const defaultNonce = useAppSelector(selectDefaultNonce);
  const selectedPrivateAddress = useAppSelector((state) =>
    selectPrivateAddressByNonce(defaultNonce ?? "")(
      state,
    )?.privateAddress.trim(),
  );
  const fallbackPrivateAddress = useAppSelector(
    selectFirstPrivateAddressWithFinalizedCoins,
  );
  const selectedAggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(state, selectedPrivateAddress),
  );
  const fallbackAggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(state, fallbackPrivateAddress),
  );
  const useFallbackAggregates =
    selectedAggregates.length === 0 && fallbackAggregates.length > 0;
  const effectivePrivateAddress = useFallbackAggregates
    ? fallbackPrivateAddress
    : selectedPrivateAddress;
  const aggregates = useFallbackAggregates
    ? fallbackAggregates
    : selectedAggregates;
  const { data: assetCatalog } = useGetAssetsQuery();

  const aggregatesWithZeroAssets = useMemo(() => {
    return withZeroAmountPrivateAssetRows(aggregates, assetCatalog);
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
      <PrivateAssetTableHeader
        postAddressPicker={postAddressPicker}
        title={translateOverview("privateAssetsTitle")}
      />
      <PrivateAssetTableBody
        translateAssets={translateAssets}
        noncesLength={effectivePrivateAddress ? 1 : 0}
        aggregates={aggregatesWithZeroAssets}
        assetMetaById={assetMetaById}
        assetUsdPriceById={assetUsdPriceById}
      />
    </div>
  );
}
