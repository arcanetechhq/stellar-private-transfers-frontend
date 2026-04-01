import React from "react";
import { usePortfolioAssets } from "@/features/view-portfolio-assets";
import { mockTransactions } from "@/shared/lib/mock";
import {
  MAX_DISPLAY_ASSETS,
  RECENT_TRANSACTIONS_LIMIT,
  formatTotalBalance,
} from "../model/overview";
import { BalanceHero } from "./balance-hero";
import { RecentTransactions } from "./recent-transactions";
import { AssetsSection } from "./assets-section";

export function Overview() {
  const { assets, totalBalanceUSD, assetCount } = usePortfolioAssets();
  const balance = formatTotalBalance(totalBalanceUSD);

  const displayAssets = assets
    .toSorted((leftItem, rightItem) => rightItem.valueUSD - leftItem.valueUSD)
    .slice(0, MAX_DISPLAY_ASSETS);

  const recentTransactions = mockTransactions.slice(0, RECENT_TRANSACTIONS_LIMIT);

  return (
    <div className="p-8" style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex gap-6">
          <BalanceHero balance={balance} assetCount={assetCount} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
        <AssetsSection assets={displayAssets} />
      </div>
    </div>
  );
}
