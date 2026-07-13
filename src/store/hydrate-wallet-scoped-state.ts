import { resetCoinState } from "@/entities/coin/model/coin-slice.js";
import {
  hydrateSeenTags,
  loadSeenTags,
  resetSeenTags,
} from "@/entities/coin-deliveries";
import { loadPrivateAddressState } from "@/entities/private-address/lib/persist-private-address";
import { loadPrivacySdkState } from "@/entities/privacy-sdk-state";
import { loadTransactionState } from "@/entities/transaction";
import {
  replaceTransactionItems,
  resetForWalletChange as resetTransactionsForWalletChange,
} from "@/entities/transaction/model/transaction.js";
import { mergeLegacyPrivateAddressIntoSdkBranch } from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
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
  dispatch(replaceTransactionItems(loadTransactionState(publicKey) ?? []));
  const loadedPrivacySdkState = loadPrivacySdkState(publicKey);
  const legacyPrivateAddress = loadPrivateAddressState(publicKey);
  const mergedBranch = mergeLegacyPrivateAddressIntoSdkBranch({
    branch: loadedPrivacySdkState ?? {},
    owner: publicKey,
    legacy: legacyPrivateAddress,
  });
  if (Object.keys(mergedBranch).length > 0) {
    dispatch(
      hydrateReduxPrivacySdkState(mergedBranch) as unknown as DispatchAction,
    );
  }
}

export function resetWalletScopedState(dispatch: AppDispatch): void {
  dispatch(resetTransactionsForWalletChange());
  dispatch(resetSeenTags());
  dispatch(resetCoinState());
  dispatch(hydrateReduxPrivacySdkState({}) as unknown as DispatchAction);
}
