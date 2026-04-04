import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionHistory } from "../model/use-transaction-history";
import { HistoryHeader } from "./history-header";
import { HistoryFilters } from "./history-filters";
import { TransactionTable } from "@/widgets/transaction-list";

export function TransactionHistory() {
  const { t: translate } = useTranslation("history");
  const state = useTransactionHistory();
  const { filteredTransactions, ...filterProperties } = state;

  return (
    <div className="bg-background min-h-full p-8">
      <div className="mx-auto max-w-7xl">
        <HistoryHeader />
        <HistoryFilters {...filterProperties} />
        <TransactionTable transactions={filteredTransactions} />
        {filteredTransactions.length === 0 && (
          <div className="border-border bg-card mt-6 rounded-xl border py-12 text-center">
            <p className="text-foreground-secondary text-sm leading-5">
              {translate("noTransactionsFound")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
