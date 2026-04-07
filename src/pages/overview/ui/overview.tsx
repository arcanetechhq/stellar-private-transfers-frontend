import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetsWithTrustlines } from "@/entities/asset";
import {
  selectTransactions,
  sortTransactionsByDateDesc,
} from "@/entities/transaction";
import { RecentTransactionList } from "@/widgets/transaction-list";
import { RECENT_TRANSACTIONS_LIMIT } from "../model/overview";
import { BalanceHero } from "./balance-hero";
import { PrivateAssetTable } from "@/widgets/private-asset-table";

export function Overview() {
  const { t: translateOverview } = useTranslation("overview");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);

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
  );
}
