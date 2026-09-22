import { resetCoinState } from "@/entities/coin/model/coin-slice.js";
import {
  hydrateSeenTags,
  loadSeenTags,
  resetSeenTags,
} from "@/entities/coin-deliveries";
import { loadTransactionState } from "@/entities/transaction";
import {
  replaceTransactionItems,
  resetForWalletChange as resetTransactionsForWalletChange,
} from "@/entities/transaction/model/transaction.js";
import { hydrateReduxPrivacySdkState } from "@arcanetech/privacy-sdk-state-redux";
import type { AppDispatch } from "./store.js";

type DispatchAction = Parameters<AppDispatch>[0];

export function hydrateWalletScopedState(
  dispatch: AppDispatch,
  publicKey: string,
): void {
  dispatch(hydrateSeenTags(loadSeenTags(publicKey)));
}

export function restoreWalletLocalSlices(
  dispatch: AppDispatch,
  publicKey: string,
): void {
  dispatch(resetCoinState());
  dispatch(replaceTransactionItems(loadTransactionState(publicKey) ?? []));
}

export function resetWalletScopedState(dispatch: AppDispatch): void {
  dispatch(resetTransactionsForWalletChange());
  dispatch(resetSeenTags());
  dispatch(resetCoinState());
  dispatch(hydrateReduxPrivacySdkState({}) as unknown as DispatchAction);
}
