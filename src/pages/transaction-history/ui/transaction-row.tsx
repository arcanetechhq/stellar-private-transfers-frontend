import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TokenIcon } from "@/shared/ui/token-icon";
import {
  getTransactionLabel,
  getStatusLabel,
  getStatusVariant,
  getAmountColor,
  getAmountPrefix,
} from "../model/transaction-history";
import { TransactionIcon } from "./transaction-icon";

interface TransactionRowProperties {
  transaction: {
    id: string;
    date: string;
    type: string;
    asset: string;
    amount: number;
    counterparty: string;
    status: string;
  };
}

const cellStyle = {
  fontSize: "14px",
  lineHeight: "20px",
} as const;

interface TransactionDateCellProperties {
  date: string;
}

function TransactionDateCell(properties: TransactionDateCellProperties) {
  return (
    <td
      className="px-6 py-4 whitespace-nowrap"
      style={{ ...cellStyle, color: "#667085" }}
    >
      {new Date(properties.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      <br />
      <span style={{ fontSize: "12px", color: "#98A2B3" }}>
        {new Date(properties.date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </td>
  );
}

export function TransactionRow(properties: TransactionRowProperties) {
  const { t: translate } = useTranslation("history");
  const { transaction } = properties;

  return (
    <tr
      className="transition-colors"
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <TransactionDateCell date={transaction.date} />
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <TransactionIcon type={transaction.type} />
          <span
            className="font-semibold"
            style={{ ...cellStyle, color: "#121826" }}
          >
            {getTransactionLabel(transaction.type, translate)}
          </span>
        </div>
      </td>
      <td
        className="px-6 py-4 whitespace-nowrap"
        style={{ ...cellStyle, color: "#121826" }}
      >
        <div className="flex items-center gap-2">
          <TokenIcon symbol={transaction.asset} size="sm" />
          <span
            className="font-semibold"
            style={{ ...cellStyle, color: "#121826" }}
          >
            {transaction.asset}
          </span>
        </div>
      </td>
      <td
        className="px-6 py-4 font-semibold whitespace-nowrap"
        style={{ ...cellStyle, color: getAmountColor(transaction.type) }}
      >
        {getAmountPrefix(transaction.type)}
        {transaction.amount.toLocaleString()}
      </td>
      <td
        className="px-6 py-4 font-mono whitespace-nowrap"
        style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}
      >
        {transaction.counterparty}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge variant={getStatusVariant(transaction.status)}>
          {getStatusLabel(transaction.status, translate)}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/transaction/${transaction.id}`}>
          <button
            className="rounded-lg p-2 transition-colors"
            style={{ color: "#667085" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "transparent";
            }}
            title={translate("viewDetails")}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </Link>
      </td>
    </tr>
  );
}
