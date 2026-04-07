import type { AssetWithTrustline } from "../model/asset";
import {
  STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS,
  formatRawAmountToDecimalString,
} from "@/shared/lib/stellar/format-stellar-raw-amount";

export function isAssetFaucetClaimable(
  showFaucet: boolean,
  asset: AssetWithTrustline,
): boolean {
  if (!showFaucet) {
    return false;
  }
  const isNative = asset.trustlineStatus === "native";
  return (
    isNative || (asset.mintable && asset.trustlineStatus === "exists")
  );
}

function formatDecimalStringWithGrouping(formatted: string): string {
  const dotIndex = formatted.indexOf(".");
  if (dotIndex === -1) {
    return BigInt(formatted).toLocaleString("en-US");
  }
  const whole = formatted.slice(0, dotIndex);
  const fractional = formatted.slice(dotIndex + 1);
  const wholeKey = whole === "" ? "0" : whole;
  const wholeFormatted = BigInt(wholeKey).toLocaleString("en-US");
  return fractional.length > 0
    ? `${wholeFormatted}.${fractional}`
    : wholeFormatted;
}

export function faucetClaimAmountLabel(asset: AssetWithTrustline): string {
  if (asset.trustlineStatus === "native") {
    return "10,000";
  }
  if (asset.mintAmount === undefined || asset.mintAmount === null) {
    return "";
  }
  const decimals =
    asset.decimals ?? STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS;
  const formatted = formatRawAmountToDecimalString(
    asset.mintAmount,
    decimals,
  );
  if (formatted === undefined) {
    return asset.mintAmount;
  }
  return formatDecimalStringWithGrouping(formatted);
}
