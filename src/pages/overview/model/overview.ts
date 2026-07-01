const SMALL_BALANCE_THRESHOLD = 1;
const SMALL_BALANCE_MIN_FRACTION_DIGITS = 3;
const SMALL_BALANCE_MAX_FRACTION_DIGITS = 8;
const REGULAR_BALANCE_FRACTION_DIGITS = 2;

export function formatTotalBalance(totalUSD: number): string {
  return totalUSD.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAssetBalance(balance: number): string {
  if (balance < SMALL_BALANCE_THRESHOLD) {
    return balance.toLocaleString("en-US", {
      minimumFractionDigits: SMALL_BALANCE_MIN_FRACTION_DIGITS,
      maximumFractionDigits: SMALL_BALANCE_MAX_FRACTION_DIGITS,
    });
  }
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
    maximumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
  });
}

export function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
