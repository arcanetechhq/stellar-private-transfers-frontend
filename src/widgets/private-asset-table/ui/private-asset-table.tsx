import React, { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/hooks";
import { getAssetUsdPrice, useGetAssetsQuery } from "@/entities/asset";
import { selectFinalizedAggregatesForStealth } from "@/entities/coin";
import { selectStealthState } from "@/entities/stealth-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { usePrivateAssetStealthNonce } from "../lib/use-private-asset-stealth-nonce";
import {
  PrivateAssetTableBody,
  PRIVATE_ASSET_TITLE_CLASS,
} from "./private-asset-table-body";
import { PrivateAssetStealthSelect } from "./private-asset-stealth-select";

type PrivateAssetTableProperties = {
  postAddressPicker?: ReactNode;
};

export function PrivateAssetTable({
  postAddressPicker,
}: PrivateAssetTableProperties) {
  const { t: translateAssets } = useTranslation("assets");
  const { t: translateOverview } = useTranslation("overview");
  const { t: translateStealth } = useTranslation("stealth");
  const { byNonce, defaultNonce } = useAppSelector(selectStealthState);
  const nonces = useMemo(() => Object.keys(byNonce).toSorted(), [byNonce]);
  const { setViewingNonce, normalizedNonce } = usePrivateAssetStealthNonce(
    defaultNonce,
    nonces,
  );
  const selectedStealthAddress = normalizedNonce
    ? byNonce[normalizedNonce]?.stealthAddress
    : undefined;
  const aggregates = useAppSelector(
    selectFinalizedAggregatesForStealth(selectedStealthAddress),
  );
  const { data: assetCatalog } = useGetAssetsQuery();

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
    <React.Fragment>
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
          noncesLength={nonces.length}
          aggregates={aggregates}
          assetMetaById={assetMetaById}
          assetUsdPriceById={assetUsdPriceById}
        />
      </div>
    </React.Fragment>
  );
}
