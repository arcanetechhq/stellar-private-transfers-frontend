import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  publicKey: string | undefined;
}

const initialState: WalletState = {
  publicKey: undefined,
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
  },
});

export const { setPublicKey, clearWallet } = walletSlice.actions;
export const walletReducer = walletSlice.reducer;

export const selectWalletPublicKey = (state: { wallet: WalletState }) =>
  state.wallet.publicKey;

export const selectIsWalletConnected = (state: { wallet: WalletState }) =>
  state.wallet.publicKey !== undefined;
