import { useState } from "react";
import "./asset-row-icon.css";
import { resolveAssetLogoUrl } from "@/shared/lib/asset/resolve-asset-logo-url";

type AssetRowIconProperties = {
  ticker: string;
  logoUrl?: string | null;
};

export function AssetRowIcon({ ticker, logoUrl }: AssetRowIconProperties) {
  const [failed, setFailed] = useState(false);
  const assetKey = ticker.toLowerCase();
  const resolvedLogoUrl = resolveAssetLogoUrl(assetKey, logoUrl);

  if (!resolvedLogoUrl || failed) {
    return (
      <span className="asset-row-icon" data-asset={assetKey}>
        <span aria-hidden="true" className="asset-row-icon__fallback">
          {ticker.slice(0, 1)}
        </span>
      </span>
    );
  }

  return (
    <span className="asset-row-icon" data-asset={assetKey}>
      <img
        src={resolvedLogoUrl}
        alt=""
        aria-hidden="true"
        onError={() => {
          setFailed(true);
        }}
      />
    </span>
  );
}
