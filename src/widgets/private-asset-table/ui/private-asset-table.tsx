import React, { type ReactNode } from "react";
import "./private-asset-table.css";
import "@/shared/styles/period-select.css";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  PrivateAssetTableBody,
  type PrivateAssetPendingClaimItem,
} from "./private-asset-table-body";
import { usePrivateAssetTableModel } from "../lib/use-private-asset-table-model";

type PendingClaimControls = {
  claimingId: string | undefined;
  canClaim: boolean;
  onClaim: (transactionId: string) => void;
  error?: string;
};

type PrivateAssetTableProperties = {
  postAddressPicker?: ReactNode;
  pendingAssetClaims?: PrivateAssetPendingClaimItem[];
  claimControls?: PendingClaimControls;
};

export function PrivateAssetTable({
  postAddressPicker,
  pendingAssetClaims,
  claimControls,
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
      {claimControls?.error ? (
        <p
          className="asset-balances-panel__claim-error"
          data-testid="escrow-claim-error"
          role="alert"
        >
          {claimControls.error}
        </p>
      ) : undefined}
      <PrivateAssetTableBody
        translateAssets={translateAssets}
        noncesLength={effectivePrivateAddress ? 1 : 0}
        aggregates={aggregatesWithZeroAssets}
        assetMetaById={assetMetaById}
        assetUsdPriceById={assetUsdPriceById}
        pendingAssetClaims={pendingAssetClaims}
        claimControls={claimControls}
      />
    </section>
  );
}
