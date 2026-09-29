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

function mergePreservingDeadOnArrivalNotes(
  mappedItems: ReturnType<typeof mapPrivateRecordsToCoinItemsFromSdkState>,
  previousItems: RootState["coin"]["items"],
): ReturnType<typeof mapPrivateRecordsToCoinItemsFromSdkState> {
  const deadNotes = previousItems.filter((item) => item.status === "dead");
  if (deadNotes.length === 0) {
    return mappedItems;
  }
  const mappedKeys = new Set(
    mappedItems.map((item) => item.commitmentHex.trim().toLowerCase()),
  );
  const preserved = deadNotes.filter(
    (item) => !mappedKeys.has(item.commitmentHex.trim().toLowerCase()),
  );
  return [...mappedItems, ...preserved];
}

export const coinSdkSyncMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const previousDeadItems = store
      .getState()
      .coin.items.filter((item) => item.status === "dead");
    const result = next(action);
    if (isPrivacySdkBranchAction(action)) {
      const mappedItems = mapPrivateRecordsToCoinItemsFromSdkState(
        store.getState(),
      );
      store.dispatch(
        replaceCoinItems(
          mergePreservingDeadOnArrivalNotes(mappedItems, previousDeadItems),
        ),
      );
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
