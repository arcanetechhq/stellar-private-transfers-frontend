import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import {
  type ExportFormat,
  type TransactionStatus,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_REGULAR,
} from "../model/data-export";
import { StepCard } from "./step-card";
import { StepNavigation } from "./step-navigation";

const FORMAT_OPTIONS = [
  { value: "csv" as const, label: "CSV", icon: "📄" },
  { value: "xlsx" as const, label: "XLSX", icon: "📊" },
  { value: "json" as const, label: "JSON", icon: "{ }" },
];

interface FormatStepProperties {
  format: ExportFormat;
  setFormat: (value: ExportFormat) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (value: boolean) => void;
  asset: string;
  setAsset: (value: string) => void;
  minAmount: string;
  setMinAmount: (value: string) => void;
  maxAmount: string;
  setMaxAmount: (value: string) => void;
  transactionStatus: TransactionStatus;
  setTransactionStatus: (value: TransactionStatus) => void;
  onBack: () => void;
}

type AdvancedFilterProperties = Pick<
  FormatStepProperties,
  | "asset"
  | "setAsset"
  | "minAmount"
  | "setMinAmount"
  | "maxAmount"
  | "setMaxAmount"
  | "transactionStatus"
  | "setTransactionStatus"
>;

const FILTER_LABEL_STYLE = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#374151",
  fontWeight: FONT_WEIGHT_MEDIUM,
};

const FILTER_CONTROL_STYLE = {
  border: "1px solid #E6E8EC",
  fontSize: "14px",
  color: "#1B1D22",
};

const CONTROL_CLASS =
  "w-full rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none";

function AdvancedFilters(properties: AdvancedFilterProperties) {
  const {
    asset, setAsset, minAmount, setMinAmount,
    maxAmount, setMaxAmount, transactionStatus, setTransactionStatus,
  } = properties;
  const { t: translate } = useTranslation("dataExport");

  return (
    <div
      className="mt-4 space-y-4 rounded-lg p-4"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block" style={FILTER_LABEL_STYLE}>{translate("formatStep.asset")}</label>
          <select
            value={asset}
            onChange={(event) => setAsset(event.target.value)}
            className={CONTROL_CLASS}
            style={FILTER_CONTROL_STYLE}
          >
            <option value="all">{translate("formatStep.allAssets")}</option>
            <option value="usdc">USDC</option>
            <option value="usdt">USDT</option>
            <option value="eth">ETH</option>
            <option value="dai">DAI</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block" style={FILTER_LABEL_STYLE}>{translate("formatStep.status")}</label>
          <select
            value={transactionStatus}
            onChange={(event) =>
              setTransactionStatus(event.target.value as TransactionStatus)
            }
            className={CONTROL_CLASS}
            style={FILTER_CONTROL_STYLE}
          >
            <option value="all">{translate("formatStep.all")}</option>
            <option value="completed">{translate("formatStep.completed")}</option>
            <option value="pending">{translate("formatStep.pending")}</option>
            <option value="rejected">{translate("formatStep.rejected")}</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block" style={FILTER_LABEL_STYLE}>{translate("formatStep.minAmount")}</label>
          <input
            type="number"
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            placeholder="From"
            className={CONTROL_CLASS}
            style={FILTER_CONTROL_STYLE}
          />
        </div>
        <div>
          <label className="mb-2 block" style={FILTER_LABEL_STYLE}>{translate("formatStep.maxAmount")}</label>
          <input
            type="number"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            placeholder="To"
            className={CONTROL_CLASS}
            style={FILTER_CONTROL_STYLE}
          />
        </div>
      </div>
    </div>
  );
}

export function FormatStep(properties: FormatStepProperties) {
  const {
    format, setFormat, showAdvancedFilters, setShowAdvancedFilters,
    asset, setAsset, minAmount, setMinAmount, maxAmount, setMaxAmount,
    transactionStatus, setTransactionStatus, onBack,
  } = properties;

  const { t: translate } = useTranslation("dataExport");

  return (
    <StepCard
      title={translate("formatStep.title")}
      description={translate("formatStep.description")}
    >
      <div className="grid grid-cols-3 gap-4">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFormat(option.value)}
            className="flex flex-col items-center gap-3 rounded-lg p-6 transition-all"
            style={{
              border:
                format === option.value
                  ? "2px solid #1B1D22"
                  : "1px solid #E6E8EC",
              backgroundColor:
                format === option.value ? "#F9FAFB" : "#FFFFFF",
            }}
          >
            <span style={{ fontSize: "32px" }}>{option.icon}</span>
            <span
              style={{
                fontSize: "15px",
                lineHeight: "22px",
                color: "#1B1D22",
                fontWeight:
                  format === option.value
                    ? FONT_WEIGHT_MEDIUM
                    : FONT_WEIGHT_REGULAR,
              }}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: "#1B1D22", fontWeight: FONT_WEIGHT_MEDIUM }}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showAdvancedFilters ? "rotate-180" : ""
            }`}
          />
          {translate("formatStep.advancedFilters")}
        </button>
        {showAdvancedFilters && (
          <AdvancedFilters
            asset={asset}
            setAsset={setAsset}
            minAmount={minAmount}
            setMinAmount={setMinAmount}
            maxAmount={maxAmount}
            setMaxAmount={setMaxAmount}
            transactionStatus={transactionStatus}
            setTransactionStatus={setTransactionStatus}
          />
        )}
      </div>
      <StepNavigation onBack={onBack} />
    </StepCard>
  );
}
