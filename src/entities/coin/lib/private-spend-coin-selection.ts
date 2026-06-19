import type { CoinWithMetadata } from "../model/coin";
import { MIN_CONFIDENTIAL_TRANSFER_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";

export const CONFIDENTIAL_SPEND_INPUT_LIMIT = 2;
export const CONFIDENTIAL_SPEND_OUTPUT_LIMIT = 2;

const INITIAL_PICKED_TOTAL_STROOPS = 0n;

function coinValueBigInt(coin: CoinWithMetadata): bigint {
  return BigInt(coin.coin.value);
}

function assertPositiveSpendStroops(spendStroops: bigint): void {
  if (spendStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Private spend amount must be positive");
  }
}

export function pickPrivateSpendCoins(parameters: {
  finalizedCoins: CoinWithMetadata[];
  spendStroops: bigint;
  insufficientBalanceMessage: string;
  maxInputNotes?: number;
}): CoinWithMetadata[] {
  assertPositiveSpendStroops(parameters.spendStroops);
  const maxInputNotes =
    parameters.maxInputNotes ?? CONFIDENTIAL_SPEND_INPUT_LIMIT;
  const sorted = [...parameters.finalizedCoins].toSorted((left, right) => {
    const leftValue = coinValueBigInt(left);
    const rightValue = coinValueBigInt(right);
    if (rightValue > leftValue) {
      return 1;
    }
    if (rightValue < leftValue) {
      return -1;
    }
    return 0;
  });
  const picked: CoinWithMetadata[] = [];
  let total = INITIAL_PICKED_TOTAL_STROOPS;
  for (const coin of sorted) {
    if (picked.length >= maxInputNotes) {
      break;
    }
    if (total >= parameters.spendStroops) {
      break;
    }
    picked.push(coin);
    total += coinValueBigInt(coin);
  }
  if (total < parameters.spendStroops) {
    throw new Error(parameters.insufficientBalanceMessage);
  }
  return picked;
}
