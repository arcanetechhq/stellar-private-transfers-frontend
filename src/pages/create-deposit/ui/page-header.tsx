import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PageHeaderProperties {
  onBack: () => void;
}

export function PageHeader(properties: PageHeaderProperties) {
  const { onBack } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{
          fontSize: "14px",
          lineHeight: "20px",
          color: "#667085",
          border: "1px solid #E7EAF0",
          backgroundColor: "#FFFFFF",
        }}
        onMouseEnter={(event) =>
          (event.currentTarget.style.backgroundColor = "#F6F7F9")
        }
        onMouseLeave={(event) =>
          (event.currentTarget.style.backgroundColor = "#FFFFFF")
        }
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHome")}
      </button>
      <h1
        className="font-semibold"
        style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}
      >
        {translate("pageTitle")}
      </h1>
      <p
        className="mt-1"
        style={{ fontSize: "16px", lineHeight: "24px", color: "#667085" }}
      >
        {translate("pageSubtitle")}
      </p>
    </div>
  );
}
