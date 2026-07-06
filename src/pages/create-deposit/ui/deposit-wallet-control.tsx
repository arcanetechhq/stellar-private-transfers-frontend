import React from "react";
import { useTranslation } from "react-i18next";
import { FlowWalletControl } from "@/shared/ui/flow-wallet-control";

export function DepositWalletControl(): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");

  return (
    <FlowWalletControl
      connectedTitle={translate("connectedWallet")}
      disconnectedTitle={translate("connectWallet")}
      connectWalletPrompt={translate("connectWalletPrompt")}
      walletProviderSuffix={translate("walletProviderSuffix")}
      changeLabel={translate("changeWallet")}
      connectLabel={translate("connect")}
      manageConnectedWalletLabel={translate("connectedWallet")}
      connectWalletLabel={translate("connectWallet")}
    />
  );
}
