import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ISupportedWallet } from "@creit-tech/stellar-wallets-kit/types";
import { WalletPickerOptionButton } from "./wallet-picker-option-button";

type WalletConnectAllWalletsContentProperties = {
  wallets: ISupportedWallet[];
  connectingId: string | null;
  isLoading: boolean;
  onBack: () => void;
  onSelectWallet: (wallet: ISupportedWallet) => void;
};

export function WalletConnectAllWalletsContent({
  wallets,
  connectingId,
  isLoading,
  onBack,
  onSelectWallet,
}: WalletConnectAllWalletsContentProperties) {
  const { t: translate } = useTranslation("common");

  return (
    <div className="stellar-wallet-picker">
      <button
        type="button"
        className="stellar-wallet-picker__back"
        onClick={onBack}
      >
        <ArrowLeft size={18} strokeWidth={1.7} aria-hidden="true" />
        {translate("a11y.back")}
      </button>

      {isLoading ? (
        <p className="stellar-wallet-picker__loading">
          {translate("walletListLoading")}
        </p>
      ) : wallets.length === 0 ? (
        <p className="stellar-wallet-picker__loading">
          {translate("walletListEmpty")}
        </p>
      ) : (
        <div className="stellar-wallet-list">
          {wallets.map((wallet) => (
            <WalletPickerOptionButton
              key={wallet.id}
              name={wallet.name}
              iconUrl={wallet.icon}
              isAvailable={wallet.isAvailable}
              isConnecting={connectingId === wallet.id}
              disabled={connectingId !== null}
              onSelect={() => onSelectWallet(wallet)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
