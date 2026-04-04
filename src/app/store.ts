import { configureStore, Tuple } from "@reduxjs/toolkit";
import {
  contactReducer,
  loadContactState,
  saveContactState,
} from "@/entities/contact";
import { assetApi } from "@/entities/asset";
import { walletReducer } from "@/entities/wallet";
import {
  buildStealthPersistPayload,
  hydrateFromStorage,
  loadStealthState,
  resetForWalletChange as resetStealthForWalletChange,
  saveStealthState,
  stealthAddressReducer,
} from "@/entities/stealth-address";
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
    stealthAddress: stealthAddressReducer,
    transaction: transactionReducer,
    coinDelivery: coinDeliveryReducer,
    coin: coinReducer,
    [assetApi.reducerPath]: assetApi.reducer,
    [coinDeliveryApi.reducerPath]: coinDeliveryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    new Tuple(
      ...getDefaultMiddleware(),
      assetApi.middleware,
      coinDeliveryApi.middleware,
    ),
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
    const loadedStealth = loadStealthState(publicKey);
    store.dispatch(hydrateFromStorage(loadedStealth));
    const loadedTransactions = loadTransactionState(publicKey);
    store.dispatch(hydrateTransactions(loadedTransactions ?? []));
    const loadedTags = loadSeenTags(publicKey);
    store.dispatch(hydrateSeenTags(loadedTags));
    const loadedCoins = loadCoinState(publicKey);
    store.dispatch(hydrateCoinState(loadedCoins));
  } else {
    store.dispatch(resetStealthForWalletChange());
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
  saveStealthState(publicKey, buildStealthPersistPayload(state.stealthAddress));
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
