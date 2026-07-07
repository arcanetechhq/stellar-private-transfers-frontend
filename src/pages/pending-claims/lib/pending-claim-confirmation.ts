import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";

const DEFAULT_ASSET_DECIMALS = 7;
const DECIMAL_RADIX = 10;

export function baseUnitsToDisplayNumber(
  value: string,
  decimals: number | null | undefined = DEFAULT_ASSET_DECIMALS,
): number {
  const digits =
    decimals === null || decimals === undefined ? DEFAULT_ASSET_DECIMALS : decimals;
  const divisor = DECIMAL_RADIX ** digits;
  return Number(BigInt(value)) / divisor;
}

export async function waitForClaimTransactionSuccess(parameters: {
  txId: string;
}): Promise<void> {
  const privacyClient = getPrivacySdkClientOrThrow();
  await privacyClient.waitForTransactionConfirmation({
    txHash: parameters.txId,
  });
}
