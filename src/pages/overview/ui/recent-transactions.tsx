import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Transaction } from "@/shared/lib/mock/ledger-transaction";
import { TransactionRow } from "./transaction-row";

interface RecentTransactionsProperties {
  transactions: Transaction[];
}

const PANEL_STYLE: React.CSSProperties = {
  border: "1px solid #E7EAF0",
  borderRadius: "20px",
  width: "50%",
  height: "260px",
};

function handleViewAllMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.color = "#111827";
}

function handleViewAllMouseLeave(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.style.color = "#667085";
}

export function RecentTransactions(properties: RecentTransactionsProperties) {
  const { transactions } = properties;
  const { t: translate } = useTranslation("overview");

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl bg-white"
      style={PANEL_STYLE}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #E7EAF0" }}
      >
        <p
          className="font-semibold"
          style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}
        >
          {translate("recentTransactions")}
        </p>
        <Link to="/history">
          <button
            className="transition-colors"
            style={{ fontSize: "13px", lineHeight: "18px", color: "#667085", fontWeight: 600 }}
            onMouseEnter={handleViewAllMouseEnter}
            onMouseLeave={handleViewAllMouseLeave}
          >
            {translate("viewAll")}
          </button>
        </Link>
      </div>
      <div className="flex-1 divide-y" style={{ borderColor: "#E7EAF0" }}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
