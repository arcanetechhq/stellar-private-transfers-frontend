import React from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  syncWalletFromStellarKitIfConnected,
  type StellarWalletConnection,
} from "@/features/stellar-wallet-connect";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import {
  MainLayoutWalletMenu,
  MainLayoutWalletTrigger,
} from "./main-layout-wallet-menu";

type MainLayoutHeaderWalletProperties = {
  translate: (key: string) => string;
  wallet: StellarWalletConnection;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
};

export function MainLayoutHeaderWallet({
  translate,
  wallet,
  walletOpen,
  setWalletOpen,
}: MainLayoutHeaderWalletProperties) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    void syncWalletFromStellarKitIfConnected(dispatch);
  }, [dispatch]);

  const shortAddress = wallet.publicKey
    ? shortenStellarAddress(wallet.publicKey)
    : "";

  const handleChangeWallet = async () => {
    setWalletOpen(false);
    await wallet.changeWallet();
  };

  const handleDisconnect = async () => {
    setWalletOpen(false);
    await wallet.disconnect();
  };

  const handleConnect = async () => {
    await wallet.connect();
  };

  if (wallet.isConnected && wallet.publicKey) {
    return (
      <div className="relative">
        <MainLayoutWalletTrigger
          shortAddress={shortAddress}
          isOpen={walletOpen}
          onToggle={() => setWalletOpen(!walletOpen)}
        />
        <MainLayoutWalletMenu
          isOpen={walletOpen}
          onClose={() => setWalletOpen(false)}
          publicKey={wallet.publicKey}
          translate={translate}
          onChangeWallet={handleChangeWallet}
          onDisconnect={handleDisconnect}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
      onClick={handleConnect}
    >
      {translate("common:connectWallet")}
    </button>
  );
}
