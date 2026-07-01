import type { Transaction } from "@/entities/transaction";

export type MonthlyNetPeriod = "thisMonth" | "lastMonth" | "thisQuarter";

type PeriodRange = {
  start: number;
  end: number;
};

function getQuarterStart(date: Date): Date {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterStartMonth, 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getQuarterEnd(date: Date): Date {
  const quarterStart = getQuarterStart(date);
  return new Date(
    quarterStart.getFullYear(),
    quarterStart.getMonth() + 3,
    0,
    23,
    59,
    59,
    999,
  );
}

function getPeriodRange(period: MonthlyNetPeriod): PeriodRange {
  const now = new Date();

  if (period === "thisMonth") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
      end: getMonthEnd(now).getTime(),
    };
  }

  if (period === "lastMonth") {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      start: monthStart.getTime(),
      end: getMonthEnd(monthStart).getTime(),
    };
  }

  return {
    start: getQuarterStart(now).getTime(),
    end: getQuarterEnd(now).getTime(),
  };
}

export function filterTransactionsByMonthlyNetPeriod(
  transactions: Transaction[],
  period: MonthlyNetPeriod,
): Transaction[] {
  const { start, end } = getPeriodRange(period);

  return transactions.filter((transaction) => {
    const timestamp = new Date(transaction.date).getTime();
    return timestamp >= start && timestamp <= end;
  });
}
