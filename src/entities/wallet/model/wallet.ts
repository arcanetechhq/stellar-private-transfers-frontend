import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type PaymentCatalogMode = "full" | "native-xlm";

export interface WalletState {
  publicKey: string | undefined;
  providerName: string | undefined;
  isWalletKitLoaded: boolean;
  paymentCatalog: PaymentCatalogMode;
}

const initialState: WalletState = {
  publicKey: undefined,
  providerName: undefined,
  isWalletKitLoaded: false,
  paymentCatalog: "full",
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setPublicKey: (state, action: PayloadAction<string>) => {
      state.publicKey = action.payload;
    },
    setWalletProviderName: (state, action: PayloadAction<string>) => {
      state.providerName = action.payload;
    },
    clearWallet: (state) => {
      state.publicKey = undefined;
      state.providerName = undefined;
      state.paymentCatalog = "full";
    },
    setWalletKitLoaded: (state) => {
      state.isWalletKitLoaded = true;
    },
    setPaymentCatalog: (state, action: PayloadAction<PaymentCatalogMode>) => {
      state.paymentCatalog = action.payload;
    },
  },
});

export const {
  setPublicKey,
  setWalletProviderName,
  clearWallet,
  setWalletKitLoaded,
  setPaymentCatalog,
} = walletSlice.actions;
export const walletReducer = walletSlice.reducer;

export const selectWalletPublicKey = (state: { wallet: WalletState }) =>
  state.wallet.publicKey;

export const selectWalletProviderName = (state: { wallet: WalletState }) =>
  state.wallet.providerName;

export const selectIsWalletConnected = (state: { wallet: WalletState }) =>
  state.wallet.publicKey !== undefined;

export const selectIsWalletKitLoaded = (state: { wallet: WalletState }) =>
  state.wallet.isWalletKitLoaded;

export const selectNativeXlmPaymentCatalog = (state: { wallet: WalletState }) =>
  state.wallet.paymentCatalog === "native-xlm";
