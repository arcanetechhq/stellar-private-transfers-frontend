import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAssetLookup } from "@/entities/asset";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction";
import {
  resolveTransactionActivityTitle,
  getAmountToneClass,
  getAmountPrefix,
} from "../lib/transaction-display";
import { buildTransactionsPathWithSelection } from "../lib/transactions-selection-path";
import { TransactionTypeIcon } from "./transaction-type-icon";

interface RecentTransactionRowProperties {
  transaction: Transaction;
}

export function RecentTransactionRow(
  properties: RecentTransactionRowProperties,
) {
  const { transaction } = properties;
  const { t: translate } = useTranslation("overview");
  const { t: translateTransactions } = useTranslation("transactions");
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountToneClass = getAmountToneClass(transaction.type);
  const amountPrefix = getAmountPrefix(transaction.type);

  return (
    <Link
      to={buildTransactionsPathWithSelection(transaction.id)}
      className={cn(
        "flex h-[68px] items-center bg-[var(--card)] px-5 transition-colors hover:bg-[var(--surface-hover)]",
      )}
    >
      <div className="flex w-full items-center gap-3">
        <TransactionTypeIcon type={transaction.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
              {resolveTransactionActivityTitle(transaction, (key) =>
                translateTransactions(key),
              )}
            </p>
            <div className="flex items-center gap-1.5">
              <AssetRowIcon
                ticker={transaction.assetId.toUpperCase()}
                logoUrl={asset?.logoUrl}
              />
              <span className="text-sm font-medium text-[var(--foreground-secondary)]">
                {assetLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className={cn("text-sm leading-5 font-semibold", amountToneClass)}>
            {amountPrefix}
            {transaction.amount.toLocaleString()}
          </p>
          <p className="text-xs leading-4 text-[var(--foreground-tertiary)]">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
