import React from "react";
import { useTranslation } from "react-i18next";
import { FlowWalletControl } from "@/shared/ui/flow-wallet-control";

export function WithdrawalWalletControl(): React.JSX.Element {
  const { t: translate } = useTranslation("withdrawal");

  return (
    <FlowWalletControl
      connectedTitle={translate("withdrawalDestination")}
      disconnectedTitle={translate("connectWallet")}
      connectWalletPrompt={translate("connectWalletPrompt")}
      walletProviderSuffix={translate("walletProviderSuffix")}
      changeLabel={translate("changeWallet")}
      connectLabel={translate("connect")}
      manageConnectedWalletLabel={translate("manageConnectedWallet")}
      connectWalletLabel={translate("connectWallet")}
    />
  );
}
