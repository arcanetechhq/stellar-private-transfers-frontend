import { useMemo, type ReactNode } from "react";
import "./private-asset-table.css";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice, useGetAssetsQuery } from "@/entities/asset";
import { selectFinalizedAggregatesForPrivateAddress } from "@/entities/coin";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { PrivateAssetTableBody } from "./private-asset-table-body";
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
  const selectedPrivateAddress = useAppSelector(
    selectPrivateAddressByNonce(defaultNonce ?? ""),
  );
  const aggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(
      state,
      selectedPrivateAddress?.privateAddress ?? undefined,
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
    <section className="asset-balances-panel ui-card">
      <div className="asset-balances-panel__header">
        <div className="asset-balances-panel__title-group">
          <span className="asset-balances-panel__icon-frame" aria-hidden="true">
            <Wallet />
          </span>
          <h2 className="asset-balances-panel__title">
            {translateOverview("privateAssetsTitle")}
          </h2>
        </div>
        {/* <div className="asset-balances-panel__meta">
          {postAddressPicker}
          <p className="asset-balances-panel__count">
            {translateAssets("privateAssets.assetsCount", {
              count: aggregatesWithZeroAssets.length,
            })}
          </p>
        </div> */}
      </div>
      <PrivateAssetTableBody
        translateAssets={translateAssets}
        noncesLength={selectedPrivateAddress ? 1 : 0}
        aggregates={aggregatesWithZeroAssets}
        assetMetaById={assetMetaById}
        assetUsdPriceById={assetUsdPriceById}
      />
    </section>
  );
}
