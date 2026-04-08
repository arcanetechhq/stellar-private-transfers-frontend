import React from "react";
import { useTranslation } from "react-i18next";

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
      </div>
    </div>
  );
}
