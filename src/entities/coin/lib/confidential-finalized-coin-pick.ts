import type { CoinWithMetadata } from "../model/coin";
import { MIN_CONFIDENTIAL_TRANSFER_STROOPS } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proof-helpers";

export const NUMBER_OF_CONFIDENTIAL_TRANSFER_INPUTS = 2;
export const NUMBER_OF_CONFIDENTIAL_WITHDRAW_INPUTS = 1;

export const NUMBER_OF_DEPOSITS = NUMBER_OF_CONFIDENTIAL_TRANSFER_INPUTS;

const INITIAL_PICKED_TOTAL_STROOPS = 0n;

function coinValueBigInt(coin: CoinWithMetadata): bigint {
  return BigInt(coin.coin.value);
}

function assertPositiveTargetStroops(
  targetStroops: bigint,
  selection: "greedyByMaxInputs" | "singleMinExcess",
): void {
  if (targetStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error(
      selection === "greedyByMaxInputs"
        ? "Transfer amount must be positive"
        : "Withdraw amount must be positive",
    );
  }
}

function pickGreedyByMaxInputNotes(parameters: {
  finalizedCoins: CoinWithMetadata[];
  targetStroops: bigint;
  maxInputNotes: number;
}): CoinWithMetadata[] {
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
    if (picked.length >= parameters.maxInputNotes) {
      break;
    }
    if (total >= parameters.targetStroops) {
      break;
    }
    picked.push(coin);
    total += coinValueBigInt(coin);
  }
  if (total < parameters.targetStroops) {
    throw new Error("Insufficient private balance for this transfer");
  }
  return picked;
}

function pickSingleNoteWithMinExcess(parameters: {
  finalizedCoins: CoinWithMetadata[];
  targetStroops: bigint;
}): CoinWithMetadata[] {
  const eligible = parameters.finalizedCoins.filter(
    (row) => coinValueBigInt(row) >= parameters.targetStroops,
  );
  if (eligible.length === 0) {
    throw new Error(
      "No single private note covers this amount; reduce the amount or merge balances first",
    );
  }
  const sorted = eligible.toSorted((left, right) => {
    const excessLeft = coinValueBigInt(left) - parameters.targetStroops;
    const excessRight = coinValueBigInt(right) - parameters.targetStroops;
    if (excessLeft < excessRight) {
      return -1;
    }
    if (excessLeft > excessRight) {
      return 1;
    }
    return 0;
  });
  const first = sorted[0];
  if (!first) {
    throw new Error(
      "No single private note covers this amount; reduce the amount or merge balances first",
    );
  }
  return [first];
}

export function pickFinalizedCoinsForConfidentialSpend(parameters: {
  finalizedCoins: CoinWithMetadata[];
  targetStroops: bigint;
  maxInputNotes: number;
  selection: "greedyByMaxInputs" | "singleMinExcess";
}): CoinWithMetadata[] {
  assertPositiveTargetStroops(parameters.targetStroops, parameters.selection);
  if (parameters.selection === "singleMinExcess") {
    return pickSingleNoteWithMinExcess({
      finalizedCoins: parameters.finalizedCoins,
      targetStroops: parameters.targetStroops,
    });
  }
  return pickGreedyByMaxInputNotes({
    finalizedCoins: parameters.finalizedCoins,
    targetStroops: parameters.targetStroops,
    maxInputNotes: parameters.maxInputNotes,
  });
}

export function pickCoinsForTransfer(parameters: {
  finalizedCoins: CoinWithMetadata[];
  transferStroops: bigint;
}): CoinWithMetadata[] {
  return pickFinalizedCoinsForConfidentialSpend({
    finalizedCoins: parameters.finalizedCoins,
    targetStroops: parameters.transferStroops,
    maxInputNotes: NUMBER_OF_CONFIDENTIAL_TRANSFER_INPUTS,
    selection: "greedyByMaxInputs",
  });
}

export function pickSingleCoinForPrivateWithdraw(parameters: {
  finalizedCoins: CoinWithMetadata[];
  withdrawStroops: bigint;
}): CoinWithMetadata {
  const picked = pickFinalizedCoinsForConfidentialSpend({
    finalizedCoins: parameters.finalizedCoins,
    targetStroops: parameters.withdrawStroops,
    maxInputNotes: NUMBER_OF_CONFIDENTIAL_WITHDRAW_INPUTS,
    selection: "singleMinExcess",
  });
  const first = picked[0];
  if (!first) {
    throw new Error("Cannot select coin for withdrawal");
  }
  return first;
}
