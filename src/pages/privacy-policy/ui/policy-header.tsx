import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

export function PolicyHeader() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}
        >
          <FileText className="h-6 w-6" style={{ color: "#667085" }} />
        </div>
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
        </div>
      </div>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "24px",
          color: "#667085",
        }}
      >
        {translate("lastUpdated")}
      </p>
    </div>
  );
}
