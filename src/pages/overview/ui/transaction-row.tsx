import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Transaction } from "@/shared/lib/mock/ledger-transaction";

interface TransactionDisplayConfig {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  background: string;
  label: string;
  amountColor: string;
  amountPrefix: string;
}

const TRANSACTION_DISPLAY: Record<string, TransactionDisplayConfig> = {
  deposit: {
    icon: ArrowDownToLine,
    iconColor: "#3B82F6",
    background: "#EFF6FF",
    label: "transactionLabels.deposit",
    amountColor: "#10B981",
    amountPrefix: "+",
  },
  sent: {
    icon: ArrowUpRight,
    iconColor: "#EF4444",
    background: "#FEF2F2",
    label: "transactionLabels.sent",
    amountColor: "#EF4444",
    amountPrefix: "-",
  },
  received: {
    icon: ArrowDownRight,
    iconColor: "#10B981",
    background: "#ECFDF5",
    label: "transactionLabels.received",
    amountColor: "#10B981",
    amountPrefix: "+",
  },
  withdrawal: {
    icon: ArrowUpFromLine,
    iconColor: "#6B7280",
    background: "#F3F4F6",
    label: "transactionLabels.withdrawal",
    amountColor: "#EF4444",
    amountPrefix: "-",
  },
};

const DEFAULT_DISPLAY: TransactionDisplayConfig = {
  icon: ArrowUpRight,
  iconColor: "#6B7280",
  background: "#F3F4F6",
  label: "",
  amountColor: "#121826",
  amountPrefix: "",
};

function getDisplayConfig(type: string): TransactionDisplayConfig {
  return TRANSACTION_DISPLAY[type] ?? { ...DEFAULT_DISPLAY, label: type };
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

interface TransactionRowProperties {
  transaction: Transaction;
}

export function TransactionRow(properties: TransactionRowProperties) {
  const { transaction } = properties;
  const { t: translate } = useTranslation("overview");
  const config = getDisplayConfig(transaction.type);
  const Icon = config.icon;

  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className="block px-5 transition-colors"
      style={ROW_STYLE}
      onMouseEnter={handleRowMouseEnter}
      onMouseLeave={handleRowMouseLeave}
    >
      <div className="flex w-full items-center gap-3">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: config.background }}
        >
          <Icon className="h-4 w-4" style={{ color: config.iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="truncate font-semibold"
              style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
            >
              {config.label ? translate(config.label) : transaction.type}
            </p>
            <div className="flex items-center gap-1.5">
              <TokenIcon symbol={transaction.asset} size="sm" />
              <span
                className="font-medium"
                style={{ fontSize: "14px", color: "#667085" }}
              >
                {transaction.asset}
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
              color: config.amountColor,
            }}
          >
            {config.amountPrefix}
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
