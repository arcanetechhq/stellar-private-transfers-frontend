const DEFAULT_ZERO_FRAC = "0000000";
const STELLAR_FRACTION_DIGITS = DEFAULT_ZERO_FRAC.length;
const MIN_STROOPS = 1n;
const HEX_GROUP = "ffff";
const U64_HEX = HEX_GROUP.repeat(HEX_GROUP.length);
const MAX_U64_STROOPS = BigInt(`0x${U64_HEX}`);

const STROOPS_RADIX = BigInt(`${1}${0}`);
export const STROOPS_PER_UNIT = STROOPS_RADIX ** BigInt(STELLAR_FRACTION_DIGITS);

export function displayAmountToStroops(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive finite number");
  }
  const fixedAmount = amount.toFixed(STELLAR_FRACTION_DIGITS);
  const [wholeRaw, fracRaw = DEFAULT_ZERO_FRAC] = fixedAmount.split(".");
  const wholeNormalized = wholeRaw.startsWith("-")
    ? wholeRaw.slice(1)
    : wholeRaw;
  const whole = wholeNormalized || "0";
  const frac = fracRaw
    .replaceAll(/\D/g, "")
    .padEnd(STELLAR_FRACTION_DIGITS, "0")
    .slice(0, STELLAR_FRACTION_DIGITS);
  const stroops = BigInt(whole) * STROOPS_PER_UNIT + BigInt(frac);
  if (stroops < MIN_STROOPS) {
    throw new Error("Amount must be at least one stroop");
  }
  if (stroops > MAX_U64_STROOPS) {
    throw new Error("Amount exceeds maximum");
  }
  return stroops;
}

export function stroopsToDisplayAmount(stroops: bigint): number {
  const intPart = stroops / STROOPS_PER_UNIT;
  const fracPart = stroops % STROOPS_PER_UNIT;
  return Number(intPart) + Number(fracPart) / Number(STROOPS_PER_UNIT);
}
