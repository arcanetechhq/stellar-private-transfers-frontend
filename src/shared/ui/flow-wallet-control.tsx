import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import {
  connectFreighterWallet,
  isWalletPickerUiEnabled,
  useStellarWalletModal,
} from "@/features/stellar-wallet-connect";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

type FlowWalletControlProperties = {
  connectedTitle: string;
  disconnectedTitle: string;
  connectWalletPrompt: string;
  walletProviderSuffix: string;
  changeLabel: string;
  connectLabel: string;
  manageConnectedWalletLabel: string;
  connectWalletLabel: string;
};

function FlowWalletAvatar(): React.JSX.Element {
  return (
    <span className="send-recipient-avatar send-wallet-avatar" aria-hidden="true">
      <Wallet size={20} strokeWidth={1.7} />
    </span>
  );
}

export function FlowWalletControl({
  connectedTitle,
  disconnectedTitle,
  connectWalletPrompt,
  walletProviderSuffix,
  changeLabel,
  connectLabel,
  manageConnectedWalletLabel,
  connectWalletLabel,
}: FlowWalletControlProperties): React.JSX.Element {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const providerLabel = useWalletProviderLabel();
  const { openPicker, openConnected } = useStellarWalletModal();
  const [isConnectingFreighter, setIsConnectingFreighter] = useState(false);
  const isConnected = Boolean(publicKey);

  function handleConnect() {
    if (isWalletPickerUiEnabled) {
      openPicker(isConnected);
      return;
    }
    if (isConnected) {
      openConnected();
      return;
    }
    void (async () => {
      setIsConnectingFreighter(true);
      try {
        await connectFreighterWallet(dispatch);
      } finally {
        setIsConnectingFreighter(false);
      }
    })();
  }

  const subtitle = isConnected
    ? `${providerLabel} ${walletProviderSuffix} · ${shortenStellarAddress(publicKey ?? "", 4, 3)}`
    : connectWalletPrompt;

  return (
    <div
      className="send-recipient-control send-flow-wallet-control"
      data-connected={isConnected ? "true" : "false"}
    >
      <div className="send-recipient-control__field send-flow-wallet-control__field">
        <FlowWalletAvatar />
        <span className="send-recipient-control__input-wrap">
          <span className="send-recipient-control__name">
            {isConnected ? connectedTitle : disconnectedTitle}
          </span>
          <span className="send-wallet-control__value">{subtitle}</span>
        </span>
        <button
          type="button"
          className="send-flow-wallet-control__action"
          data-connected={isConnected ? "true" : undefined}
          aria-label={isConnected ? manageConnectedWalletLabel : connectWalletLabel}
          disabled={isConnectingFreighter}
          onClick={handleConnect}
        >
          {isConnected ? changeLabel : connectLabel}
        </button>
      </div>
    </div>
  );
}
