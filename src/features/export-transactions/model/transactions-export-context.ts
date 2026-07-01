export type TransactionsExportFilterType = "all" | "incoming" | "outgoing";

export type TransactionsExportContext = {
  selectedCount?: number;
  filters?: {
    type?: TransactionsExportFilterType;
  };
};

export type ExportTransactionType = "all" | "inflow" | "outflow";
export type ExportFileFormat = "csv" | "xlsx";
export type ExportPeriod = "all" | "week" | "month" | "year" | "custom";

export function resolveInitialExportType(
  typeFilter: TransactionsExportFilterType | undefined,
): ExportTransactionType {
  if (typeFilter === "incoming") {
    return "inflow";
  }
  if (typeFilter === "outgoing") {
    return "outflow";
  }
  return "all";
}
