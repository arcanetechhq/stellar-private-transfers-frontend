import { createAsyncThunk } from "@reduxjs/toolkit";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  clearWallet,
  setPublicKey,
  setWalletKitLoaded,
} from "@/entities/wallet";

export const syncWalletAddressFromKit = createAsyncThunk(
  "wallet/syncWalletAddressFromKit",
  async (_argument: undefined, { dispatch }) => {
    try {
      const { address } = await StellarWalletsKitSdk.getAddress();
      dispatch(setPublicKey(address));
    } catch {
      await Promise.resolve();
    } finally {
      dispatch(setWalletKitLoaded());
    }
  },
);

export const connectStellarWallet = createAsyncThunk(
  "wallet/connectStellarWallet",
  async (_argument: undefined, { dispatch }) => {
    const { address } = await StellarWalletsKit.authModal();
    if (!address) {
      return;
    }
    dispatch(setPublicKey(address));
  },
);

export const disconnectStellarWallet = createAsyncThunk(
  "wallet/disconnectStellarWallet",
  async (_argument: undefined, { dispatch }) => {
    await StellarWalletsKit.disconnect();
    dispatch(clearWallet());
  },
);

