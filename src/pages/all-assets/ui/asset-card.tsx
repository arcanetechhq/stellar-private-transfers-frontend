import React from "react";
import { Link } from "react-router";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Asset } from "@/entities/asset";
import { TokenIcon } from "@/shared/ui/token-icon";
import {
  formatBalance,
  formatUSD,
  formatPortfolioPercent,
} from "../model/all-assets";

const CELL_TEXT_STYLE: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "20px",
  color: "#121826",
};

const SECONDARY_TEXT_STYLE: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#98A2B3",
};

interface SendAssetButtonProperties {
  assetId: string;
}

function SendAssetButton(properties: SendAssetButtonProperties) {
  const { assetId } = properties;
  const { t: translate } = useTranslation("allAssets");

  return (
    <Link to={`/create-transfer?asset=${assetId}`}>
      <button
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all"
        style={{
          fontSize: "13px",
          lineHeight: "18px",
          color: "#111827",
          fontWeight: 600,
          border: "1px solid #E7EAF0",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = "#111827";
          event.currentTarget.style.color = "#FFFFFF";
          event.currentTarget.style.borderColor = "#111827";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = "#FFFFFF";
          event.currentTarget.style.color = "#111827";
          event.currentTarget.style.borderColor = "#E7EAF0";
        }}
      >
        <Send className="h-3.5 w-3.5" />
        {translate("send")}
      </button>
    </Link>
  );
}

interface AssetCardProperties {
  asset: Asset;
  totalBalanceUSD: number;
}

export function AssetCard(properties: AssetCardProperties) {
  const { asset, totalBalanceUSD } = properties;

  return (
    <div
      className="px-6 py-4 transition-colors"
      style={{ backgroundColor: "#FFFFFF" }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = "#F9FAFB")
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = "#FFFFFF")
      }
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-4 flex items-center gap-4">
          <TokenIcon ticker={asset.ticker} size={48} />
          <div>
            <p className="mb-1 font-semibold" style={CELL_TEXT_STYLE}>
              {asset.ticker}
            </p>
            <p style={SECONDARY_TEXT_STYLE}>{asset.name}</p>
          </div>
        </div>

        <div className="col-span-2 text-right">
          <p className="font-semibold" style={CELL_TEXT_STYLE}>
            {formatBalance(asset.balance)}
          </p>
          <p style={SECONDARY_TEXT_STYLE}>{asset.ticker}</p>
        </div>

        <div className="col-span-2 text-right">
          <p className="font-semibold" style={CELL_TEXT_STYLE}>
            ${formatUSD(asset.valueUSD / asset.balance)}
          </p>
        </div>

        <div className="col-span-2 text-right">
          <p className="font-semibold" style={CELL_TEXT_STYLE}>
            ${formatUSD(asset.valueUSD)}
          </p>
          <p style={SECONDARY_TEXT_STYLE}>
            {formatPortfolioPercent({
              valueUSD: asset.valueUSD,
              totalBalanceUSD,
            })}
            %
          </p>
        </div>

        <div className="col-span-2 text-right">
          <SendAssetButton assetId={asset.id} />
        </div>
      </div>
    </div>
  );
}
