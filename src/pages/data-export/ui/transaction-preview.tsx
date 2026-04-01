import React from "react";
import { useTranslation } from "react-i18next";

import { FONT_WEIGHT_MEDIUM, MOCK_TRANSACTIONS } from "../model/data-export";

const HEADER_STYLE = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#6B7280",
  fontWeight: FONT_WEIGHT_MEDIUM,
};

const CELL_STYLE = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#1B1D22",
};

const TYPE_CELL_STYLE = {
  ...CELL_STYLE,
  color: "#6B7280",
};

export function TransactionPreview() {
  const { t: translate } = useTranslation("dataExport");

  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ border: "1px solid #E6E8EC" }}
    >
      <h2
        className="mb-4 font-semibold"
        style={{ fontSize: "16px", lineHeight: "24px", color: "#1B1D22" }}
      >
        {translate("transactionPreview.title")}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #E6E8EC" }}>
              <th className="px-4 py-3 text-left" style={HEADER_STYLE}>{translate("transactionPreview.date")}</th>
              <th className="px-4 py-3 text-left" style={HEADER_STYLE}>{translate("transactionPreview.asset")}</th>
              <th className="px-4 py-3 text-left" style={HEADER_STYLE}>{translate("transactionPreview.type")}</th>
              <th className="px-4 py-3 text-right" style={HEADER_STYLE}>{translate("transactionPreview.amount")}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map((tx, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3" style={CELL_STYLE}>{tx.date}</td>
                <td className="px-4 py-3" style={CELL_STYLE}>{tx.asset}</td>
                <td className="px-4 py-3" style={TYPE_CELL_STYLE}>{tx.type}</td>
                <td className="px-4 py-3 text-right" style={CELL_STYLE}>
                  {tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
