import type { Middleware } from "@reduxjs/toolkit";
import {
  STATE_BRIDGE_APPLY_WRITE,
  STATE_BRIDGE_HYDRATE,
} from "@arcanetech/privacy-sdk-state-redux";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { RootState } from "@/store";
import { mapPrivateRecordsToCoinItemsFromSdkState } from "../lib/map-private-records-to-coins.js";
import { syncCoinItemsToSdkState } from "../lib/sync-private-records-to-sdk.js";
import { replaceCoinItems } from "./coin-slice.js";

const COIN_TO_SDK_SYNC_ACTION =
  /^(coin\/(addCoin|finalizeCoin|markCoinSpent))$/;

function isPrivacySdkBranchAction(action: unknown): boolean {
  if (typeof action !== "object" || action === null || !("type" in action)) {
    return false;
  }
  const type = action.type;
  return type === STATE_BRIDGE_HYDRATE || type === STATE_BRIDGE_APPLY_WRITE;
}

export const coinSdkSyncMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    if (isPrivacySdkBranchAction(action)) {
      const mappedItems = mapPrivateRecordsToCoinItemsFromSdkState(store.getState());
      store.dispatch(replaceCoinItems(mappedItems));
    }
    if (
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof action.type === "string" &&
      COIN_TO_SDK_SYNC_ACTION.test(action.type)
    ) {
      const state = store.getState();
      void syncCoinItemsToSdkState(
        state.coin.items,
        selectWalletPublicKey(state),
      );
    }
    return result;
  };
