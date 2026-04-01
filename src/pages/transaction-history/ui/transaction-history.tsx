import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionHistory } from "../model/use-transaction-history";
import { HistoryHeader } from "./history-header";
import { HistoryFilters } from "./history-filters";
import { TransactionTable } from "./transaction-table";

export function TransactionHistory() {
  const { t: translate } = useTranslation("history");
  const state = useTransactionHistory();
  const { filteredTransactions, ...filterProperties } = state;

  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-7xl">
        <HistoryHeader />
        <HistoryFilters {...filterProperties} />
        <TransactionTable transactions={filteredTransactions} />
        {filteredTransactions.length === 0 && (
          <div
            className="mt-6 rounded-xl bg-white py-12 text-center"
            style={{ border: "1px solid #E7EAF0" }}
          >
            <p
              style={{
                color: "#667085",
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              {translate("noTransactionsFound")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
