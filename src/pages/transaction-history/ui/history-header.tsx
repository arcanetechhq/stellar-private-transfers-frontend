import React from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

export function HistoryHeader() {
  const { t: translate } = useTranslation("history");

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="mb-1 font-semibold"
            style={{
              fontSize: "32px",
              lineHeight: "40px",
              color: "#121826",
            }}
          >
            {translate("title")}
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#667085",
            }}
          >
            {translate("subtitle")}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors"
          style={{
            border: "1px solid #E7EAF0",
            backgroundColor: "#FFFFFF",
            color: "#111827",
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = "#F6F7F9";
            event.currentTarget.style.borderColor = "#D0D5DD";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#FFFFFF";
            event.currentTarget.style.borderColor = "#E7EAF0";
          }}
        >
          <Download className="h-4 w-4" />
          {translate("exportHistory")}
        </button>
      </div>
    </div>
  );
}
