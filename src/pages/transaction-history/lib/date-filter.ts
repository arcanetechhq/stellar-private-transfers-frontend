import type { DateFilterValue } from "../model/transaction-history";

const mockEndOfDayHour = 23;
const mockEndOfDayMinute = 59;
const mockEndOfDaySecond = 59;
const mockEndOfDayMillisecond = 999;
const mockWeekDays = 7;
const mockMonthDays = 30;
const mockQuarterDays = 90;

const mockDateFilterOffsets = {
  week: mockWeekDays,
  month: mockMonthDays,
  quarter: mockQuarterDays,
} as const;

export function getEndOfDay(date: Date) {
  const endOfDay = new Date(date);
  endOfDay.setHours(
    mockEndOfDayHour,
    mockEndOfDayMinute,
    mockEndOfDaySecond,
    mockEndOfDayMillisecond,
  );
  return endOfDay;
}

function isCustomDateRangeMatch(options: {
  transactionDate: Date;
  customStartDate: string;
  customEndDate: string;
}) {
  const { transactionDate, customStartDate, customEndDate } = options;
  if (!customStartDate || !customEndDate) {
    return true;
  }

  const start = new Date(customStartDate);
  const end = getEndOfDay(new Date(customEndDate));
  return transactionDate >= start && transactionDate <= end;
}

export function isTransactionInDateRange(options: {
  transactionDateRaw: string;
  dateFilter: DateFilterValue;
  customStartDate: string;
  customEndDate: string;
}) {
  const { transactionDateRaw, dateFilter, customStartDate, customEndDate } =
    options;

  if (dateFilter === "all") {
    return true;
  }

  const transactionDate = new Date(transactionDateRaw);
  const today = getEndOfDay(new Date());

  if (dateFilter === "today") {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    return transactionDate >= startOfToday && transactionDate <= today;
  }

  if (dateFilter === "custom") {
    return isCustomDateRangeMatch({
      transactionDate,
      customStartDate,
      customEndDate,
    });
  }

  const dayOffset = mockDateFilterOffsets[dateFilter];
  if (dayOffset === undefined) {
    return true;
  }

  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() - dayOffset);
  return transactionDate >= offsetDate;
}
