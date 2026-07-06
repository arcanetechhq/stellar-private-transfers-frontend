import { useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { disconnectStellarWallet } from "../model/stellar-wallet-thunks";
import type { StellarWalletModalMode } from "../lib/wallet-modal-mode";
import {
  StellarWalletModalContext,
  type StellarWalletModalContextValue,
  type StellarWalletModalOpenOptions,
} from "../model/stellar-wallet-modal-context";
import { StellarWalletModal } from "./stellar-wallet-modal";

type StellarWalletModalProviderProperties = {
  children: ReactNode;
};

function StellarWalletModalHost() {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const context = useContext(StellarWalletModalContext);
  if (!context) {
    return;
  }

  const { isOpen, mode, isChangeWallet, setOpen } = context;

  const handleDisconnect = async () => {
    await dispatch(disconnectStellarWallet());
  };

  return (
    <StellarWalletModal
      open={isOpen}
      onOpenChange={setOpen}
      mode={mode}
      publicKey={publicKey}
      isChangeWallet={isChangeWallet}
      onDisconnect={handleDisconnect}
    />
  );
}

export function StellarWalletModalProvider({
  children,
}: StellarWalletModalProviderProperties) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<StellarWalletModalMode>("picker");
  const [isChangeWallet, setIsChangeWallet] = useState(false);
  const [isWalletConnectInProgress, setIsWalletConnectInProgress] = useState(false);

  const open = useCallback((options: StellarWalletModalOpenOptions) => {
    setMode(options.mode);
    setIsChangeWallet(options.isChangeWallet ?? false);
    setIsOpen(true);
  }, []);

  const openConnected = useCallback(() => {
    open({ mode: "connected" });
  }, [open]);

  const openPicker = useCallback(
    (changeWallet = false) => {
      open({ mode: "picker", isChangeWallet: changeWallet });
    },
    [open],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setIsWalletConnectInProgress(false);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsWalletConnectInProgress(false);
    }
  }, []);

  const value = useMemo(
    (): StellarWalletModalContextValue => ({
      isOpen,
      mode,
      isChangeWallet,
      isWalletConnectInProgress,
      setWalletConnectInProgress: setIsWalletConnectInProgress,
      open,
      openConnected,
      openPicker,
      close,
      setOpen,
    }),
    [
      isOpen,
      mode,
      isChangeWallet,
      isWalletConnectInProgress,
      open,
      openConnected,
      openPicker,
      close,
      setOpen,
    ],
  );

  return (
    <StellarWalletModalContext.Provider value={value}>
      {children}
      <StellarWalletModalHost />
    </StellarWalletModalContext.Provider>
  );
}
