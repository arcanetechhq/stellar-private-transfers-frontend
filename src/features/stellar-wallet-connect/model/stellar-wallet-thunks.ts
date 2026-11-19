import { createAsyncThunk } from "@reduxjs/toolkit";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { WALLET_CONNECT_ID } from "@creit-tech/stellar-wallets-kit/modules/wallet-connect";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  FIREBLOCKS_WALLET_PROVIDER,
  clearWallet,
  setPaymentCatalog,
  setPublicKey,
  setWalletKitLoaded,
  setWalletProviderName,
  type WalletState,
} from "@/entities/wallet";
import { rememberKitActiveAddress } from "@/shared/lib/wallet/remember-kit-active-address";
import {
  leaveFireblocksBeforeOtherWallet,
  shouldLeaveFireblocksCustodian,
} from "../lib/leave-fireblocks-custodian";
import { FREIGHTER_WALLET_ID } from "../lib/wallet-options";
import { readWalletProviderNameFromKit } from "../lib/read-wallet-provider-name";

function isFireblocksWallet(state: unknown): boolean {
  if (!state || typeof state !== "object" || !("wallet" in state)) {
    return false;
  }
  const wallet = (state as { wallet?: WalletState }).wallet;
  return wallet?.providerName === FIREBLOCKS_WALLET_PROVIDER;
}

function restoreWalletConnectModule(): void {
  try {
    StellarWalletsKitSdk.setWallet(WALLET_CONNECT_ID);
  } catch {
    return;
  }
}

function preserveFireblocksWallet(state: unknown): boolean {
  if (!isFireblocksWallet(state)) {
    return false;
  }
  restoreWalletConnectModule();
  return true;
}

export const syncWalletAddressFromKit = createAsyncThunk(
  "wallet/syncWalletAddressFromKit",
  async (_argument: undefined, { dispatch, getState }) => {
    try {
      if (preserveFireblocksWallet(getState())) {
        return;
      }
      StellarWalletsKitSdk.setWallet(FREIGHTER_WALLET_ID);
      const { address } = await StellarWalletsKitSdk.selectedModule.getAddress({
        skipRequestAccess: true,
      });
      const trimmed = address?.trim();
      if (!trimmed || preserveFireblocksWallet(getState())) {
        return;
      }
      rememberKitActiveAddress(trimmed);
      dispatch(setPublicKey(trimmed));
      dispatch(setPaymentCatalog("full"));
      const providerName = readWalletProviderNameFromKit();
      if (providerName) {
        dispatch(setWalletProviderName(providerName));
      }
    } catch {
      preserveFireblocksWallet(getState());
    } finally {
      dispatch(setWalletKitLoaded());
    }
  },
);

export const connectStellarWallet = createAsyncThunk(
  "wallet/connectStellarWallet",
  async (_argument: undefined, { dispatch, getState }) => {
    try {
      const { address } = await StellarWalletsKit.authModal();
      if (!address) {
        return;
      }
      await leaveFireblocksBeforeOtherWallet({ dispatch, getState });
      rememberKitActiveAddress(address);
      dispatch(setPublicKey(address));
      dispatch(setPaymentCatalog("full"));
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
  async (moduleId: string, { dispatch, getState }) => {
    try {
      StellarWalletsKitSdk.setWallet(moduleId);
      const { address } = await StellarWalletsKitSdk.fetchAddress();
      await leaveFireblocksBeforeOtherWallet({ dispatch, getState });
      rememberKitActiveAddress(address);
      dispatch(setPublicKey(address));
      dispatch(setPaymentCatalog("full"));
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
  async (_argument: undefined, { dispatch, getState }) => {
    const leavingFireblocks = shouldLeaveFireblocksCustodian(getState());
    await leaveFireblocksBeforeOtherWallet({ dispatch, getState });
    try {
      await StellarWalletsKit.disconnect();
    } catch (error) {
      if (!leavingFireblocks) {
        throw error;
      }
    }
    dispatch(clearWallet());
  },
);
