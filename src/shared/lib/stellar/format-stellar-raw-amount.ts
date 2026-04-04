const STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS = 7;
const MAX_REASONABLE_ASSET_DECIMALS = 38;
const INTEGER_STRING_PATTERN = /^\d+$/;
const STELLAR_AMOUNT_SCALE_RADIX = 2 * 2 * 2 + 2;

export { STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS };

function trimTrailingZerosFromFractional(fractionalDigits: string): string {
  let result = fractionalDigits;
  while (result.endsWith("0") && result.length > 0) {
    result = result.slice(0, -1);
  }
  return result;
}

export function formatRawAmountToDecimalString(
  raw: string,
  decimals: number,
): string | undefined {
  const trimmed = raw.trim();
  if (!INTEGER_STRING_PATTERN.test(trimmed)) {
    return undefined;
  }
  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > MAX_REASONABLE_ASSET_DECIMALS
  ) {
    return undefined;
  }
  const amount = BigInt(trimmed);
  const scale = BigInt(STELLAR_AMOUNT_SCALE_RADIX) ** BigInt(decimals);
  const intPart = amount / scale;
  const fracPart = amount % scale;
  if (!fracPart) {
    return intPart.toString();
  }
  const fracString = fracPart.toString().padStart(decimals, "0");
  const fracTrimmed = trimTrailingZerosFromFractional(fracString);
  return `${intPart.toString()}.${fracTrimmed}`;
}
