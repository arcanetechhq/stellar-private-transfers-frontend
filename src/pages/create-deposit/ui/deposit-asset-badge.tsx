import React from "react";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { AssetWithTrustline } from "@/entities/asset";

const STELLAR_TOKEN_ICON = "/assets/tokens/xlm.svg";

interface DepositAssetBadgeProperties {
  asset: AssetWithTrustline;
}

function isStellarNativeAsset(asset: AssetWithTrustline): boolean {
  return asset.assetId.toLowerCase() === "xlm";
}

export function DepositAssetBadge({
  asset,
}: DepositAssetBadgeProperties): React.JSX.Element {
  if (isStellarNativeAsset(asset)) {
    return (
      <span
        className="deposit-network-badge"
        data-has-icon="true"
        aria-hidden="true"
      >
        <img src={STELLAR_TOKEN_ICON} alt="" />
      </span>
    );
  }

  return (
    <span className="deposit-asset-badge" aria-hidden="true">
      <TokenIcon
        ticker={asset.assetId.toUpperCase()}
        logoUrl={asset.logoUrl}
        size={40}
      />
    </span>
  );
}
