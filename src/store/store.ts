import { combineReducers, configureStore, Tuple } from "@reduxjs/toolkit";
import {
  bindReduxStateAdapter,
  createReduxStateAdapter,
} from "@arcanetech/privacy-sdk-state-redux";
import {
  contactReducer,
  loadContactState,
  saveContactState,
} from "@/entities/contact";
import {
  assetApi,
  assetTrustlineRefreshReducer,
  assetUiOperationsReducer,
} from "@/entities/asset";
import "@/features/faucet";
import { walletReducer } from "@/entities/wallet";
import {
  saveTransactionState,
  transactionReducer,
} from "@/entities/transaction";
import {
  coinDeliveryApi,
  coinDeliveryReducer,
  saveSeenTags,
} from "@/entities/coin-deliveries";
import { privacySdkPersistMiddleware } from "@/entities/privacy-sdk-state/model/privacy-sdk-persist-middleware.js";
import { privacySdkSyncMiddleware } from "@/entities/privacy-sdk-state/model/privacy-sdk-sync-middleware.js";
import {
  hydrateWalletScopedState,
  resetWalletScopedState,
  restoreWalletLocalSlices,
} from "./hydrate-wallet-scoped-state.js";
import { coinReducer, coinSdkSyncMiddleware } from "@/entities/coin";

const loadedContact = loadContactState();

export const privacySdkState = createReduxStateAdapter({
  reducerPath: "privacySdkState",
});

const rootReducer = combineReducers({
  contact: contactReducer,
  wallet: walletReducer,
  transaction: transactionReducer,
  coinDelivery: coinDeliveryReducer,
  coin: coinReducer,
  assetTrustlineRefresh: assetTrustlineRefreshReducer,
  assetUiOperations: assetUiOperationsReducer,
  privacySdkState: privacySdkState.reducer,
  [assetApi.reducerPath]: assetApi.reducer,
  [coinDeliveryApi.reducerPath]: coinDeliveryApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    new Tuple(
      ...getDefaultMiddleware(),
      privacySdkState.middleware,
      privacySdkPersistMiddleware,
      privacySdkSyncMiddleware,
      coinSdkSyncMiddleware,
      assetApi.middleware,
      coinDeliveryApi.middleware,
    ),
  preloadedState: loadedContact ? { contact: loadedContact } : undefined,
});

bindReduxStateAdapter(privacySdkState, store);

let lastWalletPublicKey: string | undefined;
const initialWalletPublicKey = store.getState().wallet.publicKey;
if (initialWalletPublicKey) {
  lastWalletPublicKey = initialWalletPublicKey;
  hydrateWalletScopedState(store.dispatch, initialWalletPublicKey);
  restoreWalletLocalSlices(store.dispatch, initialWalletPublicKey);
}

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  if (publicKey === lastWalletPublicKey) {
    return;
  }
  lastWalletPublicKey = publicKey;
  if (publicKey) {
    hydrateWalletScopedState(store.dispatch, publicKey);
    restoreWalletLocalSlices(store.dispatch, publicKey);
  } else {
    resetWalletScopedState(store.dispatch);
  }
});

store.subscribe(() => {
  saveContactState(store.getState().contact);
});

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  if (!publicKey) {
    return;
  }
  saveTransactionState(publicKey, state.transaction.items);
});

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  const tagsHydrated = state.coinDelivery.tagsHydrated;
  if (!publicKey || !tagsHydrated) {
    return;
  }
  saveSeenTags(publicKey, state.coinDelivery.tagsByAssetId);
});

export type AppDispatch = typeof store.dispatch;
