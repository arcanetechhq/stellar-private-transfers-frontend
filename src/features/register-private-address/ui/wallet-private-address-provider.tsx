import React, { type ReactNode } from "react";
import { useWalletPrivateAddressProviderState } from "../lib/use-wallet-private-address-provider-state";
import { WalletPrivateAddressContext } from "../model/wallet-private-address-context";

export function WalletPrivateAddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useWalletPrivateAddressProviderState();
  return (
    <WalletPrivateAddressContext.Provider value={value}>
      {children}
    </WalletPrivateAddressContext.Provider>
  );
}
