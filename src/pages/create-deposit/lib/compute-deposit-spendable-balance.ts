import type { AssetWithTrustline } from "@/entities/asset";
import {
  STROOPS_PER_UNIT,
  stroopsToDisplayAmount,
} from "@/shared/lib/stellar/stroops";

export const NATIVE_XLM_SAC_MINIMUM_BALANCE_XLM = 2;
const NATIVE_XLM_DEPOSIT_FEE_BUFFER_STROOPS = STROOPS_PER_UNIT / 2n;
const NATIVE_XLM_DEPOSIT_RESERVE_STROOPS =
  BigInt(NATIVE_XLM_SAC_MINIMUM_BALANCE_XLM) * STROOPS_PER_UNIT +
  NATIVE_XLM_DEPOSIT_FEE_BUFFER_STROOPS;
export const NATIVE_XLM_DEPOSIT_RESERVE_XLM =
  stroopsToDisplayAmount(NATIVE_XLM_DEPOSIT_RESERVE_STROOPS);
const STELLAR_FRACTION_DIGITS = 7;

export function depositAmountInputToStroops(amount: string): bigint | undefined {
  const normalized = amount.trim().replaceAll(",", "");
  if (!normalized) {
    return undefined;
  }
  if (!/^\d+(\.\d*)?$/u.test(normalized)) {
    return undefined;
  }
  const [wholeRaw, fracRaw = ""] = normalized.split(".");
  const whole = wholeRaw || "0";
  const frac = fracRaw
    .replaceAll(/\D/g, "")
    .padEnd(STELLAR_FRACTION_DIGITS, "0")
    .slice(0, STELLAR_FRACTION_DIGITS);
  return BigInt(whole) * STROOPS_PER_UNIT + BigInt(frac);
}

function balanceStringToStroops(balance: string): bigint {
  return depositAmountInputToStroops(balance) ?? 0n;
}

function stroopsToBalanceInputString(stroops: bigint): string {
  if (stroops <= 0n) {
    return "0";
  }
  const intPart = stroops / STROOPS_PER_UNIT;
  const fracPart = stroops % STROOPS_PER_UNIT;
  if (fracPart === 0n) {
    return intPart.toString();
  }
  const fracString = fracPart
    .toString()
    .padStart(STELLAR_FRACTION_DIGITS, "0")
    .replace(/0+$/, "");
  return `${intPart.toString()}.${fracString}`;
}

export function isNativeXlmDepositAsset(
  asset: AssetWithTrustline | undefined,
): boolean {
  return asset?.trustlineStatus === "native";
}

export function computeDepositSpendableBalanceStroops(
  asset: AssetWithTrustline | undefined,
  balanceRaw: string | undefined,
): bigint {
  if (!balanceRaw?.trim()) {
    return 0n;
  }
  const balanceStroops = balanceStringToStroops(balanceRaw);
  if (!isNativeXlmDepositAsset(asset)) {
    return balanceStroops;
  }
  if (balanceStroops <= NATIVE_XLM_DEPOSIT_RESERVE_STROOPS) {
    return 0n;
  }
  return balanceStroops - NATIVE_XLM_DEPOSIT_RESERVE_STROOPS;
}

export function computeDepositSpendableBalanceDisplay(
  asset: AssetWithTrustline | undefined,
  balanceRaw: string | undefined,
): number {
  return stroopsToDisplayAmount(
    computeDepositSpendableBalanceStroops(asset, balanceRaw),
  );
}

export function formatDepositSpendableBalanceInput(
  asset: AssetWithTrustline | undefined,
  balanceRaw: string | undefined,
): string {
  return stroopsToBalanceInputString(
    computeDepositSpendableBalanceStroops(asset, balanceRaw),
  );
}
