import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Asset } from "@/entities/asset";
import { AssetRow } from "./asset-row";

const VIEW_ALL_BUTTON_STYLE: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#667085",
  fontWeight: 600,
  border: "1px solid #E7EAF0",
  backgroundColor: "#FFFFFF",
  borderRadius: "10px",
};

function handleViewAllMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.backgroundColor = "#F6F7F9";
  event.currentTarget.style.borderColor = "#D0D5DD";
}

function handleViewAllMouseLeave(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.backgroundColor = "#FFFFFF";
  event.currentTarget.style.borderColor = "#E7EAF0";
}

interface AssetsSectionProperties {
  assets: Asset[];
}

export function AssetsSection(properties: AssetsSectionProperties) {
  const { assets } = properties;
  const { t: translate } = useTranslation("overview");

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #E7EAF0", borderRadius: "20px" }}
    >
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: "1px solid #E7EAF0" }}
      >
        <h2
          className="font-semibold"
          style={{ fontSize: "16px", lineHeight: "24px", color: "#121826" }}
        >
          {translate("assetsOnBalance")}
        </h2>
        <Link to="/assets">
          <button
            className="rounded-lg px-4 py-2 transition-all"
            style={VIEW_ALL_BUTTON_STYLE}
            onMouseEnter={handleViewAllMouseEnter}
            onMouseLeave={handleViewAllMouseLeave}
          >
            {translate("viewAllAssets")}
          </button>
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: "#E7EAF0" }}>
        {assets.map((asset) => (
          <AssetRow key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
