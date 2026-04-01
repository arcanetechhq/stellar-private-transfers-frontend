import React from "react";
import { useTranslation } from "react-i18next";

import { STEP_THREE, STEP_FOUR } from "../model/data-export";
import { useDataExportForm } from "../model/use-data-export-form";
import { AggregationStep } from "./aggregation-step";
import { DataTypesStep } from "./data-types-step";
import { ExportHistory } from "./export-history";
import { FormatStep } from "./format-step";
import { PeriodStep } from "./period-step";
import { ReportSummary } from "./report-summary";
import { StepIndicator } from "./step-indicator";
import { TransactionPreview } from "./transaction-preview";

function PageHeader() {
  const { t: translate } = useTranslation("dataExport");

  return (
    <div className="mb-6">
      <h1
        className="font-semibold"
        style={{ fontSize: "24px", lineHeight: "32px", color: "#1B1D22" }}
      >
        {translate("pageTitle")}
      </h1>
      <p
        className="mt-1"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#6B7280" }}
      >
        {translate("pageSubtitle")}
      </p>
    </div>
  );
}

export function DataExport() {
  const form = useDataExportForm();

  return (
    <div className="p-6" style={{ backgroundColor: "#F4F4F2" }}>
      <div className="mx-auto max-w-7xl">
        <PageHeader />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <StepIndicator currentStep={form.currentStep} />
            {form.currentStep === 1 && (
              <PeriodStep
                period={form.period}
                setPeriod={form.setPeriod}
                customDateStart={form.customDateStart}
                setCustomDateStart={form.setCustomDateStart}
                customDateEnd={form.customDateEnd}
                setCustomDateEnd={form.setCustomDateEnd}
                canProceed={form.canProceedToStep2}
                onContinue={() => form.setCurrentStep(2)}
              />
            )}
            {form.currentStep === 2 && (
              <DataTypesStep
                selectedDataTypes={form.selectedDataTypes}
                toggleDataType={form.toggleDataType}
                selectAllDataTypes={form.selectAllDataTypes}
                canProceed={form.canProceedToStep3}
                onBack={() => form.setCurrentStep(1)}
                onContinue={() => form.setCurrentStep(STEP_THREE)}
              />
            )}
            {form.currentStep === STEP_THREE && (
              <AggregationStep
                aggregation={form.aggregation}
                setAggregation={form.setAggregation}
                canProceed={form.canProceedToStep4}
                onBack={() => form.setCurrentStep(2)}
                onContinue={() => form.setCurrentStep(STEP_FOUR)}
              />
            )}
            {form.currentStep === STEP_FOUR && (
              <>
                <FormatStep
                  format={form.format}
                  setFormat={form.setFormat}
                  showAdvancedFilters={form.showAdvancedFilters}
                  setShowAdvancedFilters={form.setShowAdvancedFilters}
                  asset={form.asset}
                  setAsset={form.setAsset}
                  minAmount={form.minAmount}
                  setMinAmount={form.setMinAmount}
                  maxAmount={form.maxAmount}
                  setMaxAmount={form.setMaxAmount}
                  transactionStatus={form.transactionStatus}
                  setTransactionStatus={form.setTransactionStatus}
                  onBack={() => form.setCurrentStep(STEP_THREE)}
                />
                <TransactionPreview />
              </>
            )}
            <ExportHistory />
          </div>
          <ReportSummary
            period={form.period}
            currentStep={form.currentStep}
            isGenerating={form.isGenerating}
            onGenerate={form.handleGenerateReport}
          />
        </div>
      </div>
    </div>
  );
}
