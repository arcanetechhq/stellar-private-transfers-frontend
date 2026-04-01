export const SMALL_BALANCE_THRESHOLD = 1;
export const SMALL_BALANCE_MIN_FRACTION_DIGITS = 3;
export const SMALL_BALANCE_MAX_FRACTION_DIGITS = 8;
export const REGULAR_BALANCE_FRACTION_DIGITS = 2;
export const PERCENT_MULTIPLIER = 100;

export function formatBalance(balance: number): string {
  const isSmall = balance < SMALL_BALANCE_THRESHOLD;

  return balance.toLocaleString("en-US", {
    minimumFractionDigits: isSmall
      ? SMALL_BALANCE_MIN_FRACTION_DIGITS
      : REGULAR_BALANCE_FRACTION_DIGITS,
    maximumFractionDigits: isSmall
      ? SMALL_BALANCE_MAX_FRACTION_DIGITS
      : REGULAR_BALANCE_FRACTION_DIGITS,
  });
}

export function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface PortfolioPercentConfig {
  valueUSD: number;
  totalBalanceUSD: number;
}

export function formatPortfolioPercent(config: PortfolioPercentConfig): string {
  const { valueUSD, totalBalanceUSD } = config;
  return ((valueUSD / totalBalanceUSD) * PERCENT_MULTIPLIER).toFixed(1);
}
