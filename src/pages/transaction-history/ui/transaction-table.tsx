import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionRow } from "./transaction-row";

interface TransactionTableProperties {
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    asset: string;
    amount: number;
    counterparty: string;
    status: string;
  }>;
}

const headerStyle = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#667085",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const headerKeys = [
  "tableHeaders.date",
  "tableHeaders.type",
  "tableHeaders.asset",
  "tableHeaders.amount",
  "tableHeaders.counterparty",
  "tableHeaders.status",
  "tableHeaders.actions",
] as const;

export function TransactionTable(properties: TransactionTableProperties) {
  const { t: translate } = useTranslation("history");
  const { transactions } = properties;

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            style={{
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E7EAF0",
            }}
          >
            <tr>
              {headerKeys.map((key) => (
                <th
                  key={key}
                  className="px-6 py-3.5 text-left font-semibold"
                  style={headerStyle}
                >
                  {translate(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#E7EAF0" }}>
            {transactions.map((transaction) => (
              <TransactionRow
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
