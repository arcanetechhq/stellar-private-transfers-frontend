import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { STATE_BRIDGE_APPLY_WRITE } from "@arcanetech/privacy-sdk-state-redux";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { RootState } from "@/store";
import { isWalletScopedRestoreInFlight } from "@/store/wallet-scoped-restore.js";
import { savePrivacySdkState } from "../lib/persist-privacy-sdk-state.js";
import { savePoolMerkleStates } from "../lib/persist-pool-merkle.js";
import {
  readPoolMerkleStatesFromSdkBranch,
  walletScopedPrivacySdkBranch,
} from "../lib/privacy-sdk-branch.js";

function persistPrivacySdkBranch(store: { getState: () => RootState }): void {
  if (isWalletScopedRestoreInFlight()) {
    return;
  }
  const state = store.getState();
  const publicKey = selectWalletPublicKey(state)?.trim();
  if (!publicKey) {
    return;
  }
  const branch = state.privacySdkState;
  if (typeof branch !== "object" || branch === null || Array.isArray(branch)) {
    return;
  }
  const record = branch as Record<string, unknown>;
  savePrivacySdkState(publicKey, walletScopedPrivacySdkBranch(record));
  void savePoolMerkleStates(readPoolMerkleStatesFromSdkBranch(record));
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
