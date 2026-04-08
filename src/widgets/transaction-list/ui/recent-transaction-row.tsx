import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAssetLookup } from "@/entities/asset";
import { TokenIcon } from "@/shared/ui/token-icon";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction";
import {
  getTransactionLabel,
  getAmountToneClass,
  getAmountPrefix,
} from "../lib/transaction-display";
import { TransactionTypeIcon } from "./transaction-type-icon";

interface RecentTransactionRowProperties {
  transaction: Transaction;
}

export function RecentTransactionRow(
  properties: RecentTransactionRowProperties,
) {
  const { transaction } = properties;
  const { t: translate } = useTranslation("overview");
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountToneClass = getAmountToneClass(transaction.type);
  const amountPrefix = getAmountPrefix(transaction.type);

  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className={cn(
        "flex h-[68px] items-center bg-[var(--card)] px-5 transition-colors hover:bg-[var(--surface-hover)]",
      )}
    >
      <div className="flex w-full items-center gap-3">
        <TransactionTypeIcon type={transaction.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
              {getTransactionLabel(transaction.type, translate)}
            </p>
            <div className="flex items-center gap-1.5">
              <TokenIcon
                ticker={transaction.assetId.toUpperCase()}
                logoUrl={asset?.logoUrl}
                size="sm"
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
