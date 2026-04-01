import { configureStore, Tuple } from "@reduxjs/toolkit";
import {
  contactReducer,
  loadContactState,
  saveContactState,
} from "@/entities/contact";
import { assetApi, assetReducer } from "@/entities/asset";
import { walletReducer } from "@/entities/wallet";
import {
  hydrateFromStorage,
  loadStealthState,
  resetForWalletChange,
  saveStealthState,
  stealthAddressReducer,
} from "@/entities/stealth-address";

const loadedContact = loadContactState();

export const store = configureStore({
  reducer: {
    asset: assetReducer,
    contact: contactReducer,
    wallet: walletReducer,
    stealthAddress: stealthAddressReducer,
    [assetApi.reducerPath]: assetApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    new Tuple(...getDefaultMiddleware(), assetApi.middleware),
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
    const loaded = loadStealthState(publicKey);
    store.dispatch(hydrateFromStorage(loaded));
  } else {
    store.dispatch(resetForWalletChange());
  }
});

store.subscribe(() => {
  const state = store.getState();
  const publicKey = state.wallet.publicKey;
  if (!publicKey) {
    return;
  }
  saveStealthState(publicKey, {
    byNonce: state.stealthAddress.byNonce,
    defaultNonce: state.stealthAddress.defaultNonce,
  });
});

store.subscribe(() => {
  saveContactState(store.getState().contact);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
