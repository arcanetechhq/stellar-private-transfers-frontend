import { fetchAccountBalances } from "@/shared/stellar/fetch-account-balances";
import { horizonServer } from "@/shared/stellar/horizon-server";

export async function readNativeXlmBalance(publicKey: string): Promise<number> {
  const trimmed = publicKey.trim();
  if (!trimmed) {
    return 0;
  }
  try {
    const balances = await fetchAccountBalances(horizonServer, trimmed);
    const native = balances.find((entry) => entry.assetType === "native");
    if (!native) {
      return 0;
    }
    const parsed = Number.parseFloat(native.balance);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export function needsNativeXlmFunding(balance: number): boolean {
  return balance <= 0;
}
