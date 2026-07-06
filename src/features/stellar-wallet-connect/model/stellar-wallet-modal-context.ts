import { createContext, useContext } from "react";
import type { StellarWalletModalMode } from "../lib/wallet-modal-mode";

export type StellarWalletModalOpenOptions = {
  mode: StellarWalletModalMode;
  isChangeWallet?: boolean;
};

export type StellarWalletModalContextValue = {
  isOpen: boolean;
  mode: StellarWalletModalMode;
  isChangeWallet: boolean;
  isWalletConnectInProgress: boolean;
  setWalletConnectInProgress: (inProgress: boolean) => void;
  open: (options: StellarWalletModalOpenOptions) => void;
  openConnected: () => void;
  openPicker: (isChangeWallet?: boolean) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

export const StellarWalletModalContext = createContext<
  StellarWalletModalContextValue | undefined
>(undefined);

export function useStellarWalletModal(): StellarWalletModalContextValue {
  const context = useContext(StellarWalletModalContext);
  if (!context) {
    throw new Error(
      "useStellarWalletModal must be used within StellarWalletModalProvider",
    );
  }
  return context;
}
