import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { AssetWithTrustline } from "@/entities/asset";
import { AssetTable } from "@/widgets/asset-table";

interface TrustlineTarget {
  assetId: string;
  assetCode: string;
  issuerAddress: string;
}

interface AssetsSectionProperties {
  assets: AssetWithTrustline[];
  pendingAssetId: string | undefined;
  walletPublicKey?: string;
  onAddTrustline: (target: TrustlineTarget) => void;
}

export function AssetsSection({
  assets,
  pendingAssetId,
  walletPublicKey,
  onAddTrustline,
}: AssetsSectionProperties) {
  const { t: translate } = useTranslation("overview");

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-[16px] leading-[24px] font-semibold text-[var(--foreground-primary)]">
          {translate("publicAssetsOnBalance")}
        </h2>
        <Link to="/assets">
          <button className="rounded-[10px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[14px] leading-[20px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:border-[var(--border-focus)] hover:bg-[var(--surface-hover)]">
            {translate("viewAllAssets")}
          </button>
        </Link>
      </div>
      <AssetTable
        assets={assets}
        pendingAssetId={pendingAssetId}
        walletPublicKey={walletPublicKey}
        onAddTrustline={onAddTrustline}
        className=""
        showColumnHeaders={false}
      />
    </div>
  );
}
