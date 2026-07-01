import {
  aggregateTransactionFlow,
  type Transaction,
} from "@/entities/transaction";
import {
  filterTransactionsByMonthlyNetPeriod,
  type MonthlyNetPeriod,
} from "../model/monthly-net-period";

export type MonthlyNetTone = "positive" | "danger";

export type MonthlyNetStats = {
  inflowUsd: number;
  outflowUsd: number;
  netUsd: number;
  netTone: MonthlyNetTone;
};

export function computeMonthlyNetStats(options: {
  transactions: Transaction[];
  period: MonthlyNetPeriod;
}): MonthlyNetStats {
  const scopedTransactions = filterTransactionsByMonthlyNetPeriod(
    options.transactions,
    options.period,
  );
  const { inflowUsd, outflowUsd } =
    aggregateTransactionFlow(scopedTransactions);
  const netUsd = inflowUsd - outflowUsd;

  return {
    inflowUsd,
    outflowUsd,
    netUsd,
    netTone: netUsd >= 0 ? "positive" : "danger",
  };
}

export function formatMonthlyNetUsd(valueUsd: number): string {
  return valueUsd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedMonthlyNetUsd(valueUsd: number): string {
  const absolute = formatMonthlyNetUsd(Math.abs(valueUsd));
  if (valueUsd > 0) {
    return `+${absolute}`;
  }
  if (valueUsd < 0) {
    return `-${absolute}`;
  }
  return absolute;
}
