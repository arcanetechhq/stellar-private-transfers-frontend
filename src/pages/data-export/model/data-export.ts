export type AggregationLevel = "detailed" | "daily" | "asset" | "counterparty";
export type ExportFormat = "csv" | "xlsx" | "json";
export type TransactionStatus = "all" | "completed" | "pending" | "rejected";

export interface ExportHistoryItem {
  id: string;
  date: string;
  period: string;
  filters: string;
  format: ExportFormat;
  status: "generating" | "ready" | "expired";
}

export const MOCK_TRANSACTIONS = [
  {
    date: "2026-03-09",
    asset: "USDC",
    type: "Private Transfer",
    amount: "50,000.00",
    counterparty: "0x742d...a3f1",
    status: "Completed",
  },
  {
    date: "2026-03-08",
    asset: "ETH",
    type: "Received",
    amount: "12.5",
    counterparty: "0x8a9c...d4e2",
    status: "Completed",
  },
  {
    date: "2026-03-07",
    asset: "USDT",
    type: "Sent",
    amount: "25,000.00",
    counterparty: "0x5f3b...c7d8",
    status: "Completed",
  },
];

export const MOCK_HISTORY: ExportHistoryItem[] = [
  {
    id: "1",
    date: "2026-03-09 14:23",
    period: "Jan 1 - Jan 31, 2026",
    filters: "USDC, ETH | Completed",
    format: "xlsx",
    status: "ready",
  },
  {
    id: "2",
    date: "2026-03-05 09:15",
    period: "Last 90 days",
    filters: "All assets | All statuses",
    format: "csv",
    status: "ready",
  },
];

export const DATA_TYPE_OPTIONS = [
  { id: "all", label: "All transactions" },
  { id: "sent", label: "Sent" },
  { id: "received", label: "Received" },
  { id: "private", label: "Private transfers" },
  { id: "disclosed", label: "Disclosed" },
  { id: "confirmations", label: "Confirmations" },
];

export const GENERATE_TIMEOUT_MS = 2000;
export const FONT_WEIGHT_REGULAR = 400;
export const FONT_WEIGHT_MEDIUM = 500;
export const STEP_THREE = 3;
export const STEP_FOUR = 4;
