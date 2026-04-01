import React from "react";
import { useState } from "react";
import { usePortfolioAssets } from "@/features/view-portfolio-assets";
import { PageHeader } from "./page-header";
import { PortfolioSummary } from "./portfolio-summary";
import { AssetList } from "./asset-list";

export function AllAssets() {
  const [searchQuery, setSearchQuery] = useState("");
  const { assets, totalBalanceUSD, assetCount } = usePortfolioAssets();

  const filteredAssets = assets.filter(
    (asset) =>
      asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedAssets = filteredAssets.toSorted(
    (leftAsset, rightAsset) => rightAsset.valueUSD - leftAsset.valueUSD,
  );

  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-7xl">
        <PageHeader />
        <PortfolioSummary
          totalBalanceUSD={totalBalanceUSD}
          assetCount={assetCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AssetList
          assets={sortedAssets}
          totalBalanceUSD={totalBalanceUSD}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
