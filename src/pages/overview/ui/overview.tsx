import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice } from "@/entities/asset";
import { selectCoinItems } from "@/entities/coin";
import {
  selectAreTransactionsHydrated,
  selectTransactions,
  sortTransactionsByDateDesc,
} from "@/entities/transaction";
import { RecentTransactionList } from "@/widgets/transaction-list";
import { RECENT_TRANSACTIONS_LIMIT } from "../model/overview";
import { BalanceHero } from "./balance-hero";
import { PrivateAssetTable } from "@/widgets/private-asset-table";

function formatUsdBalance(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function Overview() {
  const { t: translateOverview } = useTranslation("overview");
  const privateCoinItems = useAppSelector(selectCoinItems);

  const transactions = useAppSelector(selectTransactions);
  const transactionsHydrated = useAppSelector(selectAreTransactionsHydrated);
  const recentTransactions = sortTransactionsByDateDesc(transactions).slice(
    0,
    RECENT_TRANSACTIONS_LIMIT,
  );

  const privateAmountByAssetId = new Map<string, number>();
  for (const item of privateCoinItems) {
    if (item.status !== "finalized") {
      continue;
    }
    const current = privateAmountByAssetId.get(item.assetId) ?? 0;
    privateAmountByAssetId.set(item.assetId, current + item.amountDisplay);
  }

  let privateAssetCount = 0;
  let totalUsdBalance = 0;
  for (const [assetId, amount] of privateAmountByAssetId.entries()) {
    if (amount <= 0) {
      continue;
    }
    privateAssetCount += 1;
    totalUsdBalance += amount * getAssetUsdPrice(assetId);
  }

  return (
    <React.Fragment>
      <div className="bg-background min-h-full p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex gap-6">
            <BalanceHero
              balance={formatUsdBalance(totalUsdBalance)}
              assetCount={privateAssetCount}
            />
            <RecentTransactionList
              transactions={recentTransactions}
              isHydrated={transactionsHydrated}
            />
          </div>
          <PrivateAssetTable
            postAddressPicker={
              <Link className="shrink-0" to="/assets">
                <button
                  type="button"
                  className="rounded-[10px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[14px] leading-[20px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:border-[var(--border-focus)] hover:bg-[var(--surface-hover)]"
                >
                  {translateOverview("viewAllAssets")}
                </button>
              </Link>
            }
          />
        </div>
      </div>
    </React.Fragment>
  );
}
