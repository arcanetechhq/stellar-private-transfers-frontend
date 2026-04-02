import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PortfolioSummaryProperties {
  assetCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PortfolioSummary({
  assetCount,
  searchQuery,
  onSearchChange,
}: PortfolioSummaryProperties) {
  const { t: translate } = useTranslation("allAssets");

  return (
    <div
      className="mb-6 rounded-xl bg-white p-6"
      style={{ border: "1px solid #E7EAF0", borderRadius: "20px" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="mb-2"
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              color: "#667085",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {translate("pageTitle")}
          </p>
          <p
            className="mt-1"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#98A2B3",
            }}
          >
            {translate("acrossAssets", { count: assetCount })}
          </p>
        </div>

        <div className="relative" style={{ width: "320px" }}>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            style={{ width: "18px", height: "18px", color: "#98A2B3" }}
          />
          <input
            type="text"
            placeholder={translate("searchPlaceholder")}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg py-2.5 pr-4 pl-10 focus:ring-2 focus:outline-none"
            style={{
              border: "1px solid #E7EAF0",
              fontSize: "14px",
              color: "#121826",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>
      </div>
    </div>
  );
}
