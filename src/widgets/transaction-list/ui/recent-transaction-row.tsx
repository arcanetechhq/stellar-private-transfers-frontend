import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAssetLookup } from "@/entities/asset";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Transaction } from "@/entities/transaction";
import { getTransactionLabel, getAmountColor, getAmountPrefix } from "../lib/transaction-display";

interface RecentTransactionRowProperties {
  transaction: Transaction;
}

const ROW_STYLE: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  height: "68px",
  display: "flex",
  alignItems: "center",
};

function handleRowMouseEnter(event: React.MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.style.backgroundColor = "#F9FAFB";
}

function handleRowMouseLeave(event: React.MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.style.backgroundColor = "#FFFFFF";
}

export function RecentTransactionRow(
  properties: RecentTransactionRowProperties,
) {
  const { transaction } = properties;
  const { t: translate } = useTranslation("overview");
  const assetMap = useAssetLookup();
  const asset = assetMap.get(transaction.assetId);
  const assetLabel = asset?.name ?? transaction.assetId;
  const amountColor = getAmountColor(transaction.type);
  const amountPrefix = getAmountPrefix(transaction.type);

  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className="block px-5 transition-colors"
      style={ROW_STYLE}
      onMouseEnter={handleRowMouseEnter}
      onMouseLeave={handleRowMouseLeave}
    >
      <div className="flex w-full items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="truncate font-semibold"
              style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
            >
              {getTransactionLabel(transaction.type, translate)}
            </p>
            <div className="flex items-center gap-1.5">
              <TokenIcon
                ticker={transaction.assetId.toUpperCase()}
                logoUrl={asset?.logoUrl}
                size="sm"
              />
              <span
                className="font-medium"
                style={{ fontSize: "14px", color: "#667085" }}
              >
                {assetLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p
            className="font-semibold"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: amountColor,
            }}
          >
            {amountPrefix}
            {transaction.amount.toLocaleString()}
          </p>
          <p
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              color: "#98A2B3",
            }}
          >
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
