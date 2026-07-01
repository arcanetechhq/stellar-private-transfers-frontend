import React from "react";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

function WithdrawWalletAvatar(): React.JSX.Element {
  return (
    <span className="send-recipient-avatar send-wallet-avatar" aria-hidden="true">
      <Wallet size={20} strokeWidth={1.7} />
    </span>
  );
}

export function WithdrawalWalletControl(): React.JSX.Element {
  const { t: translate } = useTranslation("withdrawal");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const providerLabel = useWalletProviderLabel();
  const { openPicker } = useStellarWalletModal();
  const isConnected = Boolean(publicKey);

  function handleConnect() {
    openPicker(isConnected);
  }

  return (
    <button
      type="button"
      className="send-recipient-control send-wallet-control"
      data-connected={isConnected ? "true" : "false"}
      aria-label={
        isConnected ? translate("manageConnectedWallet") : translate("connectWallet")
      }
      onClick={handleConnect}
    >
      <span className="send-recipient-control__field">
        <WithdrawWalletAvatar />
        <span className="send-recipient-control__input-wrap">
          <span className="send-recipient-control__name">
            {isConnected ? translate("connectedWallet") : translate("connectWallet")}
          </span>
          <span className="send-wallet-control__value">
            {isConnected
              ? `${providerLabel} ${translate("walletProviderSuffix")} · ${shortenStellarAddress(publicKey ?? "", 4, 3)}`
              : translate("connectWalletPrompt")}
          </span>
        </span>
      </span>
    </button>
  );
}
