import React, { useCallback } from "react";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines } from "@/entities/asset";
import {
  selectTransactions,
  sortTransactionsByDateDesc,
} from "@/entities/transaction";
import { useAddTrustline } from "@/features/add-asset-trustline";
import { RecentTransactionList } from "@/widgets/transaction-list";
import {
  MAX_DISPLAY_ASSETS,
  RECENT_TRANSACTIONS_LIMIT,
} from "../model/overview";
import { BalanceHero } from "./balance-hero";
import { AssetsSection } from "./assets-section";
import { PrivateAssetTable } from "@/widgets/private-asset-table";

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

  const transactions = useAppSelector(selectTransactions);
  const recentTransactions = sortTransactionsByDateDesc(transactions).slice(
    0,
    RECENT_TRANSACTIONS_LIMIT,
  );

  return (
    <div className="bg-background min-h-full p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex gap-6">
          <BalanceHero balance="—" assetCount={assets.length} />
          <RecentTransactionList transactions={recentTransactions} />
        </div>
        <AssetsSection
          assets={displayAssets}
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
