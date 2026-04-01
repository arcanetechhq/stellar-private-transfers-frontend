import { mockDisclosureRequests } from "@/shared/lib/mock";

export type DisclosureStatus = "pending" | "approved" | "rejected";

export type DisclosureFilter = "all" | DisclosureStatus;

export type DisclosureRequest = (typeof mockDisclosureRequests)[number];

export const DISCLOSURE_STATUS_VARIANT = {
  pending: "pending",
  approved: "success",
  rejected: "error",
} as const;

export const DISCLOSURE_STATUS_LABEL_KEYS = {
  pending: "statusLabels.pending",
  approved: "statusLabels.approved",
  rejected: "statusLabels.rejected",
} as const;

export const FILTER_OPTION_VALUES: DisclosureFilter[] = [
  "all",
  "pending",
  "approved",
  "rejected",
];

export const FILTER_OPTION_KEYS: Record<DisclosureFilter, string> = {
  all: "filterOptions.all",
  pending: "filterOptions.pending",
  approved: "filterOptions.approved",
  rejected: "filterOptions.rejected",
};

export { mockDisclosureRequests } from "@/shared/lib/mock";
