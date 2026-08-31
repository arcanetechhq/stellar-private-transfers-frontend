import React, { type ReactNode } from "react";
import "./private-asset-table.css";
import "@/shared/styles/period-select.css";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RelayReviewActions } from "@/features/submit-private-operation";
import {
  PrivateAssetTableBody,
  type PrivateAssetPendingClaimItem,
} from "./private-asset-table-body";
import { usePrivateAssetTableModel } from "../lib/use-private-asset-table-model";

type PendingClaimControls = {
  claimingId: number | undefined;
  canClaim: boolean;
  onClaim: (transactionId: string) => void;
  error?: string;
  retryAllowed?: boolean;
  fallbackAllowed?: boolean;
  onRetry?: () => void;
  onFallback?: () => void;
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
        <div>
          <p className="asset-balances-panel__claim-error" role="alert">
            {claimControls.error}
          </p>
          <RelayReviewActions
            retryAllowed={Boolean(claimControls.retryAllowed)}
            fallbackAllowed={Boolean(claimControls.fallbackAllowed)}
            disabled={claimControls.claimingId !== undefined}
            onRetry={() => claimControls.onRetry?.()}
            onFallback={() => claimControls.onFallback?.()}
          />
        </div>
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
