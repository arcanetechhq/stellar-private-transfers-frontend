import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Info, Loader2 } from "lucide-react";

import { FONT_WEIGHT_MEDIUM, STEP_FOUR } from "../model/data-export";
import { getPeriodLabel } from "../lib/get-period-label";

interface ReportSummaryProperties {
  period: string;
  currentStep: number;
  isGenerating: boolean;
  onGenerate: () => void;
}

interface SummaryField {
  label: string;
  value: string;
  large?: boolean;
}

function SummaryItem({ label, value, large }: SummaryField) {
  return (
    <div>
      <p style={{ fontSize: "12px", lineHeight: "16px", color: "#6B7280" }}>
        {label}
      </p>
      <p
        className={`mt-1 ${large ? "font-semibold" : "font-medium"}`}
        style={{
          fontSize: large ? "20px" : "14px",
          lineHeight: large ? "28px" : "20px",
          color: "#1B1D22",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function ReportSummary({
  period,
  currentStep,
  isGenerating,
  onGenerate,
}: ReportSummaryProperties) {
  const { t: translate } = useTranslation("dataExport");
  const isDisabled = isGenerating || currentStep < STEP_FOUR;

  const summaryFields: SummaryField[] = [
    { label: translate("reportSummary.period"), value: getPeriodLabel(period) },
    { label: translate("reportSummary.transactions"), value: "324", large: true },
    { label: translate("reportSummary.totalVolume"), value: "$1,245,000", large: true },
    { label: translate("reportSummary.assets"), value: "2 (USDC, ETH)" },
    { label: translate("reportSummary.counterparties"), value: "18" },
  ];

  return (
    <div className="lg:col-span-1">
      <div
        className="sticky top-6 rounded-xl bg-white p-6"
        style={{ border: "1px solid #E6E8EC" }}
      >
        <h2
          className="mb-4 font-semibold"
          style={{ fontSize: "16px", lineHeight: "24px", color: "#1B1D22" }}
        >
          {translate("reportSummary.title")}
        </h2>
        <div className="mb-6 space-y-4">
          {summaryFields.map((field) => (
            <SummaryItem key={field.label} {...field} />
          ))}
        </div>
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 transition-colors"
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: FONT_WEIGHT_MEDIUM,
            backgroundColor: isDisabled ? "#9A9DA3" : "#1B1D22",
            color: "#FFFFFF",
          }}
          onMouseEnter={(event) => {
            if (!isDisabled)
              event.currentTarget.style.backgroundColor = "#2C2F35";
          }}
          onMouseLeave={(event) => {
            if (!isDisabled)
              event.currentTarget.style.backgroundColor = "#1B1D22";
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {translate("reportSummary.generating")}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              {translate("reportSummary.generateReport")}
            </>
          )}
        </button>
        <div
          className="mt-3 flex items-start gap-2 rounded-lg p-3"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <Info className="mt-0.5 h-4 w-4" style={{ color: "#6B7280" }} />
          <p style={{ fontSize: "12px", lineHeight: "16px", color: "#6B7280" }}>
            {translate("reportSummary.downloadNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
