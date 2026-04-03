import type { CoinWithMetadata } from "@/entities/coin";
import { NUMBER_OF_DEPOSITS } from "./transfer-constants";

const MIN_TRANSFER_STROOPS = 1n;
const INITIAL_PICKED_TOTAL_STROOPS = 0n;

function coinValueBigInt(coin: CoinWithMetadata): bigint {
  return BigInt(coin.coin.value);
}

export function pickCoinsForTransfer(parameters: {
  finalizedCoins: CoinWithMetadata[];
  transferStroops: bigint;
}): CoinWithMetadata[] {
  const { finalizedCoins, transferStroops } = parameters;
  if (transferStroops < MIN_TRANSFER_STROOPS) {
    throw new Error("Transfer amount must be positive");
  }
  const sorted = [...finalizedCoins].toSorted((left, right) => {
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
    if (picked.length >= NUMBER_OF_DEPOSITS) {
      break;
    }
    if (total >= transferStroops) {
      break;
    }
    picked.push(coin);
    total += coinValueBigInt(coin);
  }
  if (total < transferStroops) {
    throw new Error("Insufficient private balance for this transfer");
  }
  return picked;
}
