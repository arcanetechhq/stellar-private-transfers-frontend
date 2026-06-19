import { configureStore } from "@reduxjs/toolkit";
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
  buildPrivateAddressPersistPayload,
  hydrateFromStorage,
  loadPrivateAddressState,
  resetForWalletChange as resetPrivateAddressForWalletChange,
  savePrivateAddressState,
  privateAddressReducer,
} from "@/entities/private-address";
import {
  hydrateTransactions,
  loadTransactionState,
  resetForWalletChange as resetTransactionsForWalletChange,
  saveTransactionState,
  transactionReducer,
} from "@/entities/transaction";
import {
  coinDeliveryApi,
  coinDeliveryReducer,
  hydrateSeenTags,
  loadSeenTags,
  resetSeenTags,
  saveSeenTags,
} from "@/entities/coin-deliveries";
import { pendingClaimsApi } from "@/entities/pending-claims";
import {
  coinReducer,
  hydrateCoinState,
  loadCoinState,
  resetCoinState,
  saveCoinState,
} from "@/entities/coin";
const loadedContact = loadContactState();

export const store = configureStore({
  reducer: {
    contact: contactReducer,
    wallet: walletReducer,
    privateAddress: privateAddressReducer,
    transaction: transactionReducer,
    coinDelivery: coinDeliveryReducer,
    coin: coinReducer,
    assetTrustlineRefresh: assetTrustlineRefreshReducer,
    assetUiOperations: assetUiOperationsReducer,
    [assetApi.reducerPath]: assetApi.reducer,
    [coinDeliveryApi.reducerPath]: coinDeliveryApi.reducer,
    [pendingClaimsApi.reducerPath]: pendingClaimsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    assetApi.middleware,
    coinDeliveryApi.middleware,
    pendingClaimsApi.middleware,
  ],
  preloadedState: loadedContact ? { contact: loadedContact } : undefined,
});

let lastWalletPublicKey: string | undefined;

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  if (publicKey === lastWalletPublicKey) {
    return;
  }
  lastWalletPublicKey = publicKey;
  if (publicKey) {
    const loadedPrivateAddress = loadPrivateAddressState(publicKey);
    store.dispatch(hydrateFromStorage(loadedPrivateAddress));
    const loadedTransactions = loadTransactionState(publicKey);
    store.dispatch(hydrateTransactions(loadedTransactions ?? []));
    const loadedTags = loadSeenTags(publicKey);
    store.dispatch(hydrateSeenTags(loadedTags));
    const loadedCoins = loadCoinState(publicKey);
    store.dispatch(hydrateCoinState(loadedCoins));
  } else {
    store.dispatch(resetPrivateAddressForWalletChange());
    store.dispatch(resetTransactionsForWalletChange());
    store.dispatch(resetSeenTags());
    store.dispatch(resetCoinState());
  }
});

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  if (!publicKey) {
    return;
  }
  savePrivateAddressState(publicKey, buildPrivateAddressPersistPayload(state.privateAddress));
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

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  const coinsHydrated = state.coin.coinsHydrated;
  if (!publicKey || !coinsHydrated) {
    return;
  }
  saveCoinState(publicKey, state.coin.items);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
