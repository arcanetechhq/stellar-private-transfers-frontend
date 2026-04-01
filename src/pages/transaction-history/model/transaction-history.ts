export type DateFilterValue =
  | "all"
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "custom";

export type FilterType = "all" | "deposits" | "transfers" | "withdrawals";

const mockActiveFontWeightValue = 600;
const mockInactiveFontWeightValue = 400;

export const mockActiveFontWeight = mockActiveFontWeightValue;
export const mockInactiveFontWeight = mockInactiveFontWeightValue;

export const dateFilterOptions: Array<{
  value: DateFilterValue;
  label: string;
}> = [
  { value: "all", label: "dateFilters.allTime" },
  { value: "today", label: "dateFilters.today" },
  { value: "week", label: "dateFilters.last7Days" },
  { value: "month", label: "dateFilters.last30Days" },
  { value: "quarter", label: "dateFilters.last90Days" },
  { value: "custom", label: "dateFilters.customRange" },
];

export function getTransactionLabel(
  type: string,
  translate: (key: string) => string,
): string {
  const map: Record<string, string> = {
    deposit: translate("transactionLabels.deposit"),
    sent: translate("transactionLabels.sent"),
    received: translate("transactionLabels.received"),
    withdrawal: translate("transactionLabels.withdrawal"),
  };
  return map[type] ?? type;
}

export function getStatusLabel(
  status: string,
  translate: (key: string) => string,
): string {
  const map: Record<string, string> = {
    completed: translate("statusLabels.completed"),
    pending: translate("statusLabels.pending"),
    processing: translate("statusLabels.processing"),
    created: translate("statusLabels.created"),
    failed: translate("statusLabels.failed"),
  };
  return map[status] ?? status;
}

export function getStatusVariant(status: string) {
  switch (status) {
    case "completed": {
      return "success";
    }
    case "pending": {
      return "pending";
    }
    case "processing": {
      return "info";
    }
    case "failed": {
      return "error";
    }
    default: {
      return "info";
    }
  }
}

export function getAmountColor(type: string) {
  switch (type) {
    case "sent":
    case "withdrawal": {
      return "#EF4444";
    }
    case "received":
    case "deposit": {
      return "#10B981";
    }
    default: {
      return "#121826";
    }
  }
}

export function getAmountPrefix(type: string) {
  switch (type) {
    case "sent":
    case "withdrawal": {
      return "-";
    }
    case "received":
    case "deposit": {
      return "+";
    }
    default: {
      return "";
    }
  }
}
