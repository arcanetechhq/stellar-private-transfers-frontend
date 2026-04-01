import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

import { FONT_WEIGHT_MEDIUM, MOCK_HISTORY } from "../model/data-export";
import { ExportHistoryRow } from "./export-history-row";

const HEADER_COLUMN_KEYS = [
  "exportHistory.date",
  "exportHistory.period",
  "exportHistory.format",
  "exportHistory.status",
  "exportHistory.actions",
] as const;

const HEADER_STYLE = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#6B7280",
  fontWeight: FONT_WEIGHT_MEDIUM,
};

export function ExportHistory() {
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
        {translate("exportHistory.title")}
      </h2>
      {MOCK_HISTORY.length === 0 ? (
        <div className="py-12 text-center">
          <FileText
            className="mx-auto mb-3 h-12 w-12"
            style={{ color: "#D1D5DB" }}
          />
          <p style={{ fontSize: "14px", lineHeight: "20px", color: "#6B7280" }}>
            {translate("exportHistory.noExports")}
          </p>
          <p
            className="mt-1"
            style={{ fontSize: "13px", lineHeight: "18px", color: "#9CA3AF" }}
          >
            {translate("exportHistory.reportsWillAppear")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #E6E8EC" }}>
                {HEADER_COLUMN_KEYS.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left"
                    style={HEADER_STYLE}
                  >
                    {translate(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((item) => (
                <ExportHistoryRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
