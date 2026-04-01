import { useState } from "react";

import {
  type AggregationLevel,
  type ExportFormat,
  type TransactionStatus,
  DATA_TYPE_OPTIONS,
  GENERATE_TIMEOUT_MS,
} from "./data-export";

export function useDataExportForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [period, setPeriod] = useState("last-30");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(["all"]);
  const [aggregation, setAggregation] = useState<AggregationLevel>("detailed");
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [asset, setAsset] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleDataType = (id: string) => {
    if (id === "all") {
      setSelectedDataTypes(["all"]);
      return;
    }
    const filtered = selectedDataTypes.filter(
      (dataType) => dataType !== "all",
    );
    if (filtered.includes(id)) {
      const updated = filtered.filter((dataType) => dataType !== id);
      setSelectedDataTypes(updated.length === 0 ? ["all"] : updated);
    } else {
      setSelectedDataTypes([...filtered, id]);
    }
  };

  const selectAllDataTypes = () => {
    setSelectedDataTypes(DATA_TYPE_OPTIONS.map((opt) => opt.id));
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(1);
      alert("Report generated successfully!");
    }, GENERATE_TIMEOUT_MS);
  };

  const canProceedToStep2 = period !== "";
  const canProceedToStep3 = selectedDataTypes.length > 0;
  const canProceedToStep4 = aggregation !== "";

  return {
    currentStep,
    setCurrentStep,
    period,
    setPeriod,
    customDateStart,
    setCustomDateStart,
    customDateEnd,
    setCustomDateEnd,
    selectedDataTypes,
    toggleDataType,
    selectAllDataTypes,
    aggregation,
    setAggregation,
    format,
    setFormat,
    showAdvancedFilters,
    setShowAdvancedFilters,
    asset,
    setAsset,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    transactionStatus,
    setTransactionStatus,
    isGenerating,
    handleGenerateReport,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  };
}
