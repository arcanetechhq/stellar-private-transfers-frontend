import { createAsyncThunk } from "@reduxjs/toolkit";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  clearWallet,
  setPublicKey,
  setWalletKitLoaded,
  setWalletProviderName,
} from "@/entities/wallet";
import { ensureEscrowTagsForWallet } from "@/features/discover-escrow-notes";
import { FREIGHTER_WALLET_ID } from "../lib/wallet-options";
import { readWalletProviderNameFromKit } from "../lib/read-wallet-provider-name";

export const syncWalletAddressFromKit = createAsyncThunk(
  "wallet/syncWalletAddressFromKit",
  async (_argument: undefined, { dispatch }) => {
    try {
      StellarWalletsKitSdk.setWallet(FREIGHTER_WALLET_ID);
      const { address } = await StellarWalletsKitSdk.selectedModule.getAddress({
        skipRequestAccess: true,
      });
      const trimmed = address?.trim();
      if (!trimmed) {
        return;
      }
      dispatch(setPublicKey(trimmed));
      const providerName = readWalletProviderNameFromKit();
      if (providerName) {
        dispatch(setWalletProviderName(providerName));
      }
      await ensureEscrowTagsForWallet(trimmed);
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
    try {
      const { address } = await StellarWalletsKit.authModal();
      if (!address) {
        return;
      }
      dispatch(setPublicKey(address));
      const providerName = readWalletProviderNameFromKit();
      if (providerName) {
        dispatch(setWalletProviderName(providerName));
      }
      return address;
    } catch {
      return;
    }
  },
);

export const connectStellarWalletModule = createAsyncThunk(
  "wallet/connectStellarWalletModule",
  async (moduleId: string, { dispatch }) => {
    try {
      StellarWalletsKitSdk.setWallet(moduleId);
      const { address } = await StellarWalletsKitSdk.fetchAddress();
      dispatch(setPublicKey(address));
      const providerName = readWalletProviderNameFromKit();
      if (providerName) {
        dispatch(setWalletProviderName(providerName));
      }
      return address;
    } catch {
      return;
    }
  },
);

export const disconnectStellarWallet = createAsyncThunk(
  "wallet/disconnectStellarWallet",
  async (_argument: undefined, { dispatch }) => {
    await StellarWalletsKit.disconnect();
    dispatch(clearWallet());
  },
);

