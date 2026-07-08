import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { STATE_BRIDGE_APPLY_WRITE } from "@arcanetech/privacy-sdk-state-redux";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { RootState } from "@/store";
import { savePrivacySdkState } from "../lib/persist-privacy-sdk-state.js";

function persistPrivacySdkBranch(store: { getState: () => RootState }): void {
  const state = store.getState();
  const publicKey = selectWalletPublicKey(state)?.trim();
  if (!publicKey) {
    return;
  }
  const branch = state.privacySdkState;
  if (typeof branch === "object" && branch !== null && !Array.isArray(branch)) {
    savePrivacySdkState(publicKey, branch as Record<string, unknown>);
  }
}

function isApplyWriteAction(action: unknown): action is UnknownAction {
  return (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    action.type === STATE_BRIDGE_APPLY_WRITE
  );
}

export const privacySdkPersistMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    if (isApplyWriteAction(action)) {
      persistPrivacySdkBranch(store);
    }
    return result;
  };

export type { PrivacySdkStateReducerAction } from "@arcanetech/privacy-sdk-state-redux";
