import React from "react";
import { FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ConfirmationsInfoBanner() {
  const { t: translate } = useTranslation("confirmations");
  return (
    <div
      className="mt-6 flex gap-4 rounded-xl p-5"
      style={{ backgroundColor: "#EFF6FF", border: "1px solid #DBEAFE" }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "#DBEAFE" }}
      >
        <FileCheck className="h-5 w-5" style={{ color: "#3B82F6" }} />
      </div>
      <div>
        <h3
          className="mb-2 font-medium"
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            color: "#1E40AF",
          }}
        >
          {translate("aboutTitle")}
        </h3>
        <p
          className="mb-3"
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            color: "#1E40AF",
          }}
        >
          {translate("aboutDescription")}
        </p>
        <ul
          className="space-y-1"
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            color: "#1E40AF",
            listStyleType: "disc",
            paddingLeft: "20px",
          }}
        >
          <li>{translate("useCase1")}</li>
          <li>{translate("useCase2")}</li>
          <li>{translate("useCase3")}</li>
          <li>{translate("useCase4")}</li>
        </ul>
      </div>
    </div>
  );
}
