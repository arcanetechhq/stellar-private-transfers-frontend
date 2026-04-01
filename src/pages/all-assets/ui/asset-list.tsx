import React from "react";
import { useTranslation } from "react-i18next";
import type { Asset } from "@/entities/asset";
import { AssetListHeader } from "./asset-list-header";
import { AssetCard } from "./asset-card";

interface AssetListProperties {
  assets: Asset[];
  totalBalanceUSD: number;
  searchQuery: string;
}

export function AssetList(properties: AssetListProperties) {
  const { assets, totalBalanceUSD, searchQuery } = properties;
  const { t: translate } = useTranslation("allAssets");

  if (assets.length === 0) {
    return (
      <div
        className="overflow-hidden rounded-xl bg-white"
        style={{ border: "1px solid #E7EAF0", borderRadius: "20px" }}
      >
        <AssetListHeader />
        <div className="px-6 py-12 text-center">
          <p
            style={{
              fontSize: "15px",
              lineHeight: "22px",
              color: "#98A2B3",
            }}
          >
            {translate("noAssetsFound", { query: searchQuery })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #E7EAF0", borderRadius: "20px" }}
    >
      <AssetListHeader />
      <div className="divide-y" style={{ borderColor: "#E7EAF0" }}>
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            totalBalanceUSD={totalBalanceUSD}
          />
        ))}
      </div>
    </div>
  );
}
