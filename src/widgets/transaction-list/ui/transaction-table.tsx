import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";
import type { Transaction } from "@/entities/transaction";
import { TransactionTableRow } from "./transaction-table-row";

interface TransactionTableProperties {
  transactions: Transaction[];
}

const headerKeys = [
  "tableHeaders.date",
  "tableHeaders.type",
  "tableHeaders.asset",
  "tableHeaders.amount",
  "tableHeaders.counterparty",
  "tableHeaders.status",
] as const;

export function TransactionTable(properties: TransactionTableProperties) {
  const { t: translate } = useTranslation("history");
  const { transactions } = properties;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[var(--border)] bg-[var(--muted)]">
            <tr>
              {headerKeys.map((key) => (
                <th
                  key={key}
                  className={cn(
                    "px-6 py-3.5 text-left text-xs leading-4 font-semibold tracking-wide text-[var(--foreground-secondary)] uppercase",
                  )}
                >
                  {translate(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {transactions.map((transaction) => (
              <TransactionTableRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
