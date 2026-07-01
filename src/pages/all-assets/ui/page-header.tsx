import React from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PageHeader() {
  const { t: translate } = useTranslation("allAssets");
  return (
    <div className="mb-6">
      <Link to="/">
        <button
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
      </Link>
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
