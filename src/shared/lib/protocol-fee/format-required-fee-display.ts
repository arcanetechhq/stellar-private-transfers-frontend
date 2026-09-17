import {
  STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS,
  formatRawAmountToDecimalString,
} from "@/shared/lib/stellar/format-stellar-raw-amount.js";

export function formatRequiredFeeDisplay(input: {
  requiredFeeMinor: string;
  decimals: number;
  ticker: string;
}): string | undefined {
  const amount = formatRawAmountToDecimalString(
    input.requiredFeeMinor,
    input.decimals,
  );
  if (!amount) {
    return undefined;
  }
  const ticker = input.ticker.trim();
  if (!ticker) {
    return amount;
  }
  return `${amount} ${ticker}`;
}

export function protocolFeeDecimals(decimals: number | null | undefined): number {
  return decimals ?? STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS;
}
