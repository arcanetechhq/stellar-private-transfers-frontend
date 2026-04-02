import React, { useCallback } from "react";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines } from "@/entities/asset";
import { useAddTrustline } from "@/features/add-asset-trustline";
import { mockTransactions } from "@/shared/lib/mock";
import {
  MAX_DISPLAY_ASSETS,
  RECENT_TRANSACTIONS_LIMIT,
} from "../model/overview";
import { BalanceHero } from "./balance-hero";
import { RecentTransactions } from "./recent-transactions";
import { AssetsSection } from "./assets-section";

export function Overview() {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets, refetch } = useAssetsWithTrustlines(publicKey);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { addTrustline, pendingAssetId } = useAddTrustline(
    publicKey,
    handleSuccess,
  );

  const displayAssets = assets
    .toSorted((left, right) => left.id - right.id)
    .slice(0, MAX_DISPLAY_ASSETS);

  const recentTransactions = mockTransactions.slice(0, RECENT_TRANSACTIONS_LIMIT);

  return (
    <div className="p-8" style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex gap-6">
          <BalanceHero balance="—" assetCount={assets.length} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
        <AssetsSection
          assets={displayAssets}
          pendingAssetId={pendingAssetId}
          walletPublicKey={publicKey ?? undefined}
          onAddTrustline={addTrustline}
          onMintSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
