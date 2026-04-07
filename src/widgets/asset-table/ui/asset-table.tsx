import React from "react";
import { Networks } from "@stellar/stellar-sdk";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { STELLAR_NETWORK_PASSPHRASE } from "@/shared/stellar/horizon-server";
import { AssetTableRow } from "./asset-table-row";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

interface AssetTableProperties {
  assets: AssetWithTrustline[];
  emptyMessage?: string;
  pendingAssetId: string | undefined;
  walletPublicKey?: string;
  onAddTrustline: (target: TrustlineTarget) => void;
  className?: string;
  showColumnHeaders?: boolean;
}

const isTestnet = STELLAR_NETWORK_PASSPHRASE === Networks.TESTNET;

export function AssetTable({
  assets,
  emptyMessage,
  pendingAssetId,
  walletPublicKey,
  onAddTrustline,
  className = "rounded-[20px] border border-[var(--border)]",
  showColumnHeaders = true,
}: AssetTableProperties) {
  const { t: translate } = useTranslation("assets");

  if (assets.length === 0) {
    return (
      <div className={`overflow-hidden bg-[var(--card)] ${className}`}>
        <div className="px-6 py-12 text-center">
          <p className="text-[15px] leading-[22px] text-[var(--muted-foreground)]">
            {emptyMessage ?? translate("noAssetsFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-[var(--card)] ${className}`}>
      {showColumnHeaders && (
        <div className="grid grid-cols-12 gap-4 border-b border-[var(--border)] px-6 py-3">
          <div className="col-span-5 text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            {translate("tableHeaders.asset")}
          </div>
          <div className="col-span-4 text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            {translate("tableHeaders.balance")}
          </div>
          <div className="col-span-3 text-right text-[12px] leading-[16px] font-medium tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            {translate("tableHeaders.actions")}
          </div>
        </div>
      )}
      <div className="divide-y divide-[var(--border)]">
        {assets.map((asset) => (
          <AssetTableRow
            key={asset.id}
            asset={asset}
            pendingAssetId={pendingAssetId}
            showFaucet={isTestnet}
            walletPublicKey={walletPublicKey}
            onAddTrustline={onAddTrustline}
          />
        ))}
      </div>
    </div>
  );
}
