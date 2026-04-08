import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  connectStellarWallet,
  disconnectStellarWallet,
} from "@/features/stellar-wallet-connect";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import {
  MainLayoutWalletMenu,
  MainLayoutWalletTrigger,
} from "./main-layout-wallet-menu";

type MainLayoutHeaderWalletProperties = {
  translate: (key: string) => string;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
};

export function MainLayoutHeaderWallet({
  translate,
  walletOpen,
  setWalletOpen,
}: MainLayoutHeaderWalletProperties) {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const isConnected = Boolean(publicKey);

  const shortAddress = publicKey ? shortenStellarAddress(publicKey) : "";

  const handleChangeWallet = async () => {
    setWalletOpen(false);
    await dispatch(connectStellarWallet());
  };

  const handleDisconnect = async () => {
    setWalletOpen(false);
    await dispatch(disconnectStellarWallet());
  };

  const handleConnect = () => {
    void dispatch(connectStellarWallet());
  };

  if (isConnected && publicKey) {
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
          publicKey={publicKey}
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
      className="min-h-[48px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
      onClick={handleConnect}
    >
      {translate("common:connectWallet")}
    </button>
  );
}
