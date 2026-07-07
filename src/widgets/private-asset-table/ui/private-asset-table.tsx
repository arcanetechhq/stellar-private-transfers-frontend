import React, { type ReactNode } from "react";
import "./private-asset-table.css";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PrivateAssetTableBody } from "./private-asset-table-body";
import { usePrivateAssetTableModel } from "../lib/use-private-asset-table-model";

type PrivateAssetTableProperties = {
  postAddressPicker?: ReactNode;
};

export function PrivateAssetTable({
  postAddressPicker,
}: PrivateAssetTableProperties) {
  const { t: translateAssets } = useTranslation("assets");
  const { t: translateOverview } = useTranslation("overview");
  const {
    effectivePrivateAddress,
    aggregatesWithZeroAssets,
    assetMetaById,
    assetUsdPriceById,
  } = usePrivateAssetTableModel();

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
        {postAddressPicker ? (
          <div className="asset-balances-panel__meta">{postAddressPicker}</div>
        ) : undefined}
      </div>
      <PrivateAssetTableBody
        translateAssets={translateAssets}
        noncesLength={effectivePrivateAddress ? 1 : 0}
        aggregates={aggregatesWithZeroAssets}
        assetMetaById={assetMetaById}
        assetUsdPriceById={assetUsdPriceById}
      />
    </section>
  );
}
