export const CONFIRMATION_PERIODS = [
  "all",
  "week",
  "month",
  "year",
  "custom",
] as const;

export type ConfirmationPeriodKind = (typeof CONFIRMATION_PERIODS)[number];

const START_OF_UTC_DAY = "T00:00:00.000Z";
const END_OF_UTC_DAY = "T23:59:59.999Z";

export function confirmationPeriodKey(input: {
  kind: ConfirmationPeriodKind;
  fromDate: string;
  toDate: string;
}): string {
  if (input.kind !== "custom") {
    return input.kind;
  }
  return `custom:${input.fromDate}:${input.toDate}`;
}

export function confirmationPeriodBody(input: {
  kind: ConfirmationPeriodKind;
  fromDate: string;
  toDate: string;
}):
  | { kind: "all" | "week" | "month" | "year" }
  | { kind: "custom"; from: string; to: string }
  | undefined {
  if (input.kind !== "custom") {
    return { kind: input.kind };
  }
  if (!input.fromDate || !input.toDate || input.fromDate > input.toDate) {
    return undefined;
  }
  return {
    kind: "custom",
    from: `${input.fromDate}${START_OF_UTC_DAY}`,
    to: `${input.toDate}${END_OF_UTC_DAY}`,
  };
}
