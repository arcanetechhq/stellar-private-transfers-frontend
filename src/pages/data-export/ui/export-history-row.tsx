import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Download, Loader2 } from "lucide-react";

import type { ExportHistoryItem } from "../model/data-export";

interface ExportHistoryRowProperties {
  item: ExportHistoryItem;
}

const CELL_STYLE = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#1B1D22",
};

export function ExportHistoryRow({ item }: ExportHistoryRowProperties) {
  const { t: translate } = useTranslation("dataExport");

  return (
    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
      <td className="px-4 py-3" style={CELL_STYLE}>{item.date}</td>
      <td className="px-4 py-3" style={CELL_STYLE}>{item.period}</td>
      <td
        className="px-4 py-3 uppercase"
        style={{ fontSize: "13px", lineHeight: "20px", color: "#1B1D22" }}
      >
        {item.format}
      </td>
      <td className="px-4 py-3">
        {item.status === "ready" && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-1"
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              backgroundColor: "#ECFDF5",
              color: "#047857",
            }}
          >
            <CheckCircle2 className="h-3 w-3" />
            {translate("exportHistory.ready")}
          </span>
        )}
        {item.status === "generating" && (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-1"
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
            }}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            {translate("exportHistory.generating")}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {item.status === "ready" && (
          <button
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors"
            style={{
              fontSize: "13px",
              lineHeight: "20px",
              color: "#1B1D22",
              border: "1px solid #E6E8EC",
              backgroundColor: "#FFFFFF",
            }}
            onMouseEnter={(event) =>
              (event.currentTarget.style.backgroundColor = "#F9FAFB")
            }
            onMouseLeave={(event) =>
              (event.currentTarget.style.backgroundColor = "#FFFFFF")
            }
          >
            <Download className="h-4 w-4" />
            {translate("exportHistory.download")}
          </button>
        )}
      </td>
    </tr>
  );
}
