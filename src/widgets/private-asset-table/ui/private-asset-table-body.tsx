import React from "react";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { PrivateAssetRow } from "./private-asset-row";
import {
  PendingAssetClaimRow,
  type PendingAssetClaimRowModel,
} from "./pending-asset-claim-row";

type TranslateAssets = (
  key: string,
  options?: Record<string, string | number>,
) => string;

type AssetMeta = { name: string; logoUrl: string | null };

export type PrivateAssetPendingClaimItem = {
  claimId: string;
  transactionId: string;
  assetId: string;
  amountDisplay: number;
};

type PendingClaimControls = {
  claimingId: string | undefined;
  canClaim: boolean;
  onClaim: (transactionId: string) => void;
};

type PrivateAssetTableBodyProperties = {
  translateAssets: TranslateAssets;
  noncesLength: number;
  aggregates: AggregatedPrivateAssetRow[];
  assetMetaById: Map<string, AssetMeta>;
  assetUsdPriceById: Map<string, number>;
  pendingAssetClaims?: PrivateAssetPendingClaimItem[];
  claimControls?: PendingClaimControls;
};

function PanelEmptyState({ message }: { message: string }) {
  return (
    <div className="asset-balances-panel__empty">
      <p className="asset-balances-panel__empty-text">{message}</p>
    </div>
  );
}

function collectPendingAssetIds(
  pendingAssetClaims: PrivateAssetPendingClaimItem[],
): Set<string> {
  const assetIds = new Set<string>();
  for (const claim of pendingAssetClaims) {
    assetIds.add(claim.assetId);
  }
  return assetIds;
}

function filterAggregatesForPending(parameters: {
  aggregates: AggregatedPrivateAssetRow[];
  pendingAssetIds: Set<string>;
}): AggregatedPrivateAssetRow[] {
  return parameters.aggregates.filter((row) => {
    if (row.totalAmountDisplay > 0) {
      return true;
    }
    return !parameters.pendingAssetIds.has(row.assetId);
  });
}

function buildPendingRowModel(parameters: {
  claim: PrivateAssetPendingClaimItem;
  assetMetaById: Map<string, AssetMeta>;
  assetUsdPriceById: Map<string, number>;
}): PendingAssetClaimRowModel {
  const meta = parameters.assetMetaById.get(parameters.claim.assetId);
  const usdPrice =
    parameters.assetUsdPriceById.get(parameters.claim.assetId) ?? 1;
  return {
    claimId: parameters.claim.claimId,
    transactionId: parameters.claim.transactionId,
    assetId: parameters.claim.assetId,
    assetName: meta?.name ?? parameters.claim.assetId,
    logoUrl: meta?.logoUrl,
    amountDisplay: parameters.claim.amountDisplay,
    usdAmount: parameters.claim.amountDisplay * usdPrice,
  };
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

function renderPendingClaimRows(parameters: {
  pendingAssetClaims: PrivateAssetPendingClaimItem[];
  assetMetaById: Map<string, AssetMeta>;
  assetUsdPriceById: Map<string, number>;
  claimControls: PendingClaimControls;
}) {
  return parameters.pendingAssetClaims.map((claim) => (
    <PendingAssetClaimRow
      key={claim.transactionId}
      row={buildPendingRowModel({
        claim,
        assetMetaById: parameters.assetMetaById,
        assetUsdPriceById: parameters.assetUsdPriceById,
      })}
      claimControls={parameters.claimControls}
    />
  ));
}

export function PrivateAssetTableBody({
  translateAssets,
  noncesLength,
  aggregates,
  assetMetaById,
  assetUsdPriceById,
  pendingAssetClaims = [],
  claimControls,
}: PrivateAssetTableBodyProperties) {
  const hasPendingClaims =
    pendingAssetClaims.length > 0 && claimControls !== undefined;
  const pendingAssetIds = collectPendingAssetIds(pendingAssetClaims);
  const visibleAggregates = filterAggregatesForPending({
    aggregates,
    pendingAssetIds,
  });

  if (noncesLength === 0 && !hasPendingClaims) {
    return (
      <PanelEmptyState
        message={translateAssets("privateAssets.noPrivateAddresses")}
      />
    );
  }
  if (visibleAggregates.length === 0 && !hasPendingClaims) {
    return (
      <PanelEmptyState message={translateAssets("privateAssets.noCoins")} />
    );
  }

  const showAssetRows = noncesLength > 0 && visibleAggregates.length > 0;

  return (
    <div className="asset-balances-panel__list">
      {showAssetRows
        ? renderAssetRows({
            aggregates: visibleAggregates,
            assetMetaById,
            assetUsdPriceById,
          })
        : undefined}
      {hasPendingClaims
        ? renderPendingClaimRows({
            pendingAssetClaims,
            assetMetaById,
            assetUsdPriceById,
            claimControls,
          })
        : undefined}
    </div>
  );
}
