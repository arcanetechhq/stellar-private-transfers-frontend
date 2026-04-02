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
