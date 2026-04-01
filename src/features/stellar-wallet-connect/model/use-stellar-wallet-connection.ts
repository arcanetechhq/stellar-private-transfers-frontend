import { useCallback } from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  clearWallet,
  selectIsWalletConnected,
  selectWalletPublicKey,
  setPublicKey,
} from "@/entities/wallet";

export function useStellarWalletConnection() {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const isConnected = useAppSelector(selectIsWalletConnected);

  const connect = useCallback(async () => {
    const { address } = await StellarWalletsKit.authModal();
    if (!address) {
      return;
    }
    dispatch(setPublicKey(address));
  }, [dispatch]);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    dispatch(clearWallet());
  }, [dispatch]);

  const changeWallet = useCallback(async () => {
    const { address } = await StellarWalletsKit.authModal();
    if (!address) {
      return;
    }
    dispatch(setPublicKey(address));
  }, [dispatch]);

  return {
    changeWallet,
    connect,
    disconnect,
    isConnected,
    publicKey,
  };
}

export type StellarWalletConnection = ReturnType<typeof useStellarWalletConnection>;
