import React from "react";
import { FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ConfirmationsHeader() {
  const { t: translate } = useTranslation("confirmations");
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="mt-1"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#6B7280",
            }}
          >
            {translate("pageSubtitle")}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-5 py-3 transition-colors"
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 500,
            backgroundColor: "#1B1D22",
            color: "#FFFFFF",
          }}
          onMouseEnter={(event) =>
            (event.currentTarget.style.backgroundColor = "#2C2F35")
          }
          onMouseLeave={(event) =>
            (event.currentTarget.style.backgroundColor = "#1B1D22")
          }
        >
          <FileCheck className="h-4 w-4" />
          {translate("createConfirmation")}
        </button>
      </div>
    </div>
  );
}
