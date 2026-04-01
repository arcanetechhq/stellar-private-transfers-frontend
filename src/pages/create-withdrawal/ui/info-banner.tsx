import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InfoBanner() {
  const { t: translate } = useTranslation("withdrawal");
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "#FFFAEB", border: "1px solid #FEF0C7" }}
    >
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#F79009" }} />
        <div>
          <p
            className="mb-1 font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#B54708" }}
          >
            {translate("aboutWithdrawals")}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#B54708" }}>
            {translate("aboutWithdrawalsText")}
          </p>
        </div>
      </div>
    </div>
  );
}
