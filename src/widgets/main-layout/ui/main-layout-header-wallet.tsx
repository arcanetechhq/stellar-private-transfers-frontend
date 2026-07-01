import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  disconnectStellarWallet,
  useStellarWalletModal,
} from "@/features/stellar-wallet-connect";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { Wallet } from "lucide-react";
import { ConnectedWalletPanel } from "./connected-wallet-panel";
import { MainLayoutWalletTrigger } from "./main-layout-wallet-menu";

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
  const { openConnected, openPicker } = useStellarWalletModal();
  const accountMenuReference = useRef<HTMLDivElement>(null);

  const shortAddress = publicKey ? shortenStellarAddress(publicKey, 4, 3) : "";

  useEffect(() => {
    if (!walletOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuReference.current?.contains(event.target as Node)) {
        setWalletOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setWalletOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [walletOpen, setWalletOpen]);

  const handleDisconnect = async () => {
    setWalletOpen(false);
    await dispatch(disconnectStellarWallet());
  };

  const handleManageWallet = () => {
    setWalletOpen(false);
    openConnected();
  };

  const handleChangeWallet = () => {
    setWalletOpen(false);
    openPicker(true);
  };

  const handleConnect = () => {
    openPicker();
  };

  if (isConnected && publicKey) {
    return (
      <div className="account-menu" ref={accountMenuReference}>
        <MainLayoutWalletTrigger
          shortAddress={shortAddress}
          isOpen={walletOpen}
          onToggle={() => setWalletOpen(!walletOpen)}
        />
        <ConnectedWalletPanel
          isOpen={walletOpen}
          publicKey={publicKey}
          onClose={() => setWalletOpen(false)}
          onManageWallet={handleManageWallet}
          onChangeWallet={handleChangeWallet}
          onDisconnect={handleDisconnect}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="topbar-action user-menu user-menu--connect"
      onClick={handleConnect}
    >
      <span className="user-menu__wallet-icon" aria-hidden="true">
        <Wallet size={18} strokeWidth={1.6} />
      </span>
      <span className="user-menu__name">{translate("common:connectWallet")}</span>
    </button>
  );
}
