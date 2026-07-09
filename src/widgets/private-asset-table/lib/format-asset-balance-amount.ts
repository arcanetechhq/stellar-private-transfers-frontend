const SMALL_BALANCE_THRESHOLD = 1;
const SMALL_BALANCE_MIN_FRACTION_DIGITS = 3;
const SMALL_BALANCE_MAX_FRACTION_DIGITS = 8;
const REGULAR_BALANCE_FRACTION_DIGITS = 2;
const USD_FRACTION_DIGITS = 2;

export function formatAggregatedBalance(value: number): string {
  if (value < SMALL_BALANCE_THRESHOLD) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: SMALL_BALANCE_MIN_FRACTION_DIGITS,
      maximumFractionDigits: SMALL_BALANCE_MAX_FRACTION_DIGITS,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
    maximumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
  });
}

export function formatUsdAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: USD_FRACTION_DIGITS,
    maximumFractionDigits: USD_FRACTION_DIGITS,
  });
}
