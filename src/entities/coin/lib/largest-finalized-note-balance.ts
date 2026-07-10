import type { CoinWithMetadata } from "../model/coin";
import { stroopsToAmountInputString } from "@/shared/lib/stellar/stroops";
import { CONFIDENTIAL_SPEND_INPUT_LIMIT } from "./private-spend-coin-selection";

function privateAddressKey(privateAddress: string | undefined): string | undefined {
  const trimmed = privateAddress?.trim();
  return trimmed || undefined;
}

function coinValueStroops(coin: CoinWithMetadata): bigint {
  return BigInt(coin.coin.value);
}

function listFinalizedNotesForAsset(parameters: {
  coins: CoinWithMetadata[];
  privateAddress: string | undefined;
  assetId: string;
}): CoinWithMetadata[] {
  const privateAddress = privateAddressKey(parameters.privateAddress);
  if (!privateAddress) {
    return [];
  }
  return parameters.coins.filter(
    (coin) =>
      coin.status === "finalized" &&
      privateAddressKey(coin.privateAddress) === privateAddress &&
      coin.assetId === parameters.assetId,
  );
}

export function getMaxWithdrawStroops(parameters: {
  coins: CoinWithMetadata[];
  privateAddress: string | undefined;
  assetId: string;
  maxInputNotes?: number;
}): bigint {
  const maxInputNotes = parameters.maxInputNotes ?? CONFIDENTIAL_SPEND_INPUT_LIMIT;
  const sorted = listFinalizedNotesForAsset(parameters).toSorted((left, right) => {
    const leftValue = coinValueStroops(left);
    const rightValue = coinValueStroops(right);
    if (rightValue > leftValue) {
      return 1;
    }
    if (rightValue < leftValue) {
      return -1;
    }
    return 0;
  });
  let total = 0n;
  for (const coin of sorted.slice(0, maxInputNotes)) {
    total += coinValueStroops(coin);
  }
  return total;
}

export function formatMaxWithdrawBalanceInput(parameters: {
  coins: CoinWithMetadata[];
  privateAddress: string | undefined;
  assetId: string;
  maxInputNotes?: number;
}): string {
  return stroopsToAmountInputString(getMaxWithdrawStroops(parameters));
}

export function getLargestFinalizedNoteStroops(parameters: {
  coins: CoinWithMetadata[];
  privateAddress: string | undefined;
  assetId: string;
}): bigint {
  return getMaxWithdrawStroops({ ...parameters, maxInputNotes: 1 });
}

export function formatLargestFinalizedNoteBalanceInput(parameters: {
  coins: CoinWithMetadata[];
  privateAddress: string | undefined;
  assetId: string;
}): string {
  return formatMaxWithdrawBalanceInput({ ...parameters, maxInputNotes: 1 });
}
