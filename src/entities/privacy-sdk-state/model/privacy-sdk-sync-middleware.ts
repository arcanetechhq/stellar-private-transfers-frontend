import type { Middleware } from "@reduxjs/toolkit";
import { assetApi } from "@/entities/asset";
import type { RootState } from "@/store";
import { syncAssetsToSdkState } from "../lib/sync-assets-to-sdk-state.js";

function privacySdkSyncMiddlewareHandler(next: (action: unknown) => unknown) {
  return (action: unknown) => {
    const result = next(action);
    if (assetApi.endpoints.getAssets.matchFulfilled(action)) {
      syncAssetsToSdkState(action.payload).catch(() => {
        return;
      });
    }
    return result;
  };
}

export const privacySdkSyncMiddleware: Middleware<object, RootState> =
  () => privacySdkSyncMiddlewareHandler;
