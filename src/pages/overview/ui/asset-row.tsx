import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Send } from "lucide-react";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Asset } from "@/entities/asset";
import { formatAssetBalance, formatUSD } from "../model/overview";

const SEND_BUTTON_STYLE: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#111827",
  fontWeight: 600,
  border: "1px solid #E7EAF0",
  backgroundColor: "#FFFFFF",
  borderRadius: "10px",
};

function handleRowMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
  event.currentTarget.style.backgroundColor = "#F9FAFB";
}

function handleRowMouseLeave(event: React.MouseEvent<HTMLDivElement>) {
  event.currentTarget.style.backgroundColor = "#FFFFFF";
}

function handleSendMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.backgroundColor = "#111827";
  event.currentTarget.style.color = "#FFFFFF";
  event.currentTarget.style.borderColor = "#111827";
}

function handleSendMouseLeave(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.backgroundColor = "#FFFFFF";
  event.currentTarget.style.color = "#111827";
  event.currentTarget.style.borderColor = "#E7EAF0";
}

interface AssetRowProperties {
  asset: Asset;
}

export function AssetRow(properties: AssetRowProperties) {
  const { asset } = properties;
  const { t: translate } = useTranslation("overview");

  return (
    <div
      className="px-6 py-4 transition-colors"
      style={{ backgroundColor: "#FFFFFF" }}
      onMouseEnter={handleRowMouseEnter}
      onMouseLeave={handleRowMouseLeave}
    >
      <div className="flex items-center gap-4">
        <TokenIcon ticker={asset.ticker} size={40} />
        <div className="grid flex-1 grid-cols-12 items-center gap-4">
          <div className="col-span-3">
            <p
              className="mb-1 font-semibold"
              style={{ fontSize: "15px", lineHeight: "20px", color: "#121826" }}
            >
              {asset.ticker}
            </p>
            <p style={{ fontSize: "13px", lineHeight: "18px", color: "#98A2B3" }}>
              {asset.name}
            </p>
          </div>
          <div className="col-span-2 text-right">
            <p style={{ fontSize: "13px", lineHeight: "18px", color: "#667085", marginBottom: "2px" }}>
              {translate("balance")}
            </p>
            <p
              className="font-semibold"
              style={{ fontSize: "15px", lineHeight: "20px", color: "#121826" }}
            >
              {formatAssetBalance(asset.balance)}
            </p>
          </div>
          <div className="col-span-2 text-right">
            <p style={{ fontSize: "13px", lineHeight: "18px", color: "#667085", marginBottom: "2px" }}>
              {translate("value")}
            </p>
            <p
              className="font-semibold"
              style={{ fontSize: "15px", lineHeight: "20px", color: "#121826" }}
            >
              ${formatUSD(asset.valueUSD)}
            </p>
          </div>
          <div className="col-span-5 flex justify-end gap-2 text-right">
            <Link to={`/create-transfer?asset=${asset.id}`}>
              <button
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
                style={SEND_BUTTON_STYLE}
                onMouseEnter={handleSendMouseEnter}
                onMouseLeave={handleSendMouseLeave}
              >
                <Send className="h-3.5 w-3.5" />
                {translate("send")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
