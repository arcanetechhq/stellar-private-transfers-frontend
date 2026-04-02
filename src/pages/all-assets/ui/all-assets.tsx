import React, { useState, useCallback } from "react";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines } from "@/entities/asset";
import { useAddTrustline } from "@/features/add-asset-trustline";
import { AssetTable } from "@/widgets/asset-table";
import { PrivateAssetTable } from "@/widgets/private-asset-table";
import { PageHeader } from "./page-header";
import { PortfolioSummary } from "./portfolio-summary";

export function AllAssets() {
  const [searchQuery, setSearchQuery] = useState("");

  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets, refetch } = useAssetsWithTrustlines(publicKey);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { addTrustline, pendingAssetId } = useAddTrustline(
    publicKey,
    handleSuccess,
  );

  const filteredAssets = assets.filter(
    (asset) =>
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedAssets = filteredAssets.toSorted((left, right) => left.id - right.id);

  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader />
        <PortfolioSummary
          assetCount={assets.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AssetTable
          assets={sortedAssets}
          pendingAssetId={pendingAssetId}
          walletPublicKey={publicKey ?? undefined}
          onAddTrustline={addTrustline}
          onMintSuccess={handleSuccess}
        />
        <PrivateAssetTable />
      </div>
    </div>
  );
}
