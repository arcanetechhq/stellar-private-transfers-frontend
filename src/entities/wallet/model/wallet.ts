import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  publicKey: string | undefined;
  isWalletKitLoaded: boolean;
}

const initialState: WalletState = {
  publicKey: undefined,
  isWalletKitLoaded: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setPublicKey: (state, action: PayloadAction<string>) => {
      state.publicKey = action.payload;
    },
    clearWallet: (state) => {
      state.publicKey = undefined;
    },
    setWalletKitLoaded: (state) => {
      state.isWalletKitLoaded = true;
    },
  },
});

export const { setPublicKey, clearWallet, setWalletKitLoaded } =
  walletSlice.actions;
export const walletReducer = walletSlice.reducer;

export const selectWalletPublicKey = (state: { wallet: WalletState }) =>
  state.wallet.publicKey;

export const selectIsWalletConnected = (state: { wallet: WalletState }) =>
  state.wallet.publicKey !== undefined;

export const selectIsWalletKitLoaded = (state: { wallet: WalletState }) =>
  state.wallet.isWalletKitLoaded;
