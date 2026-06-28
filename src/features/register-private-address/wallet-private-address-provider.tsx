import React, { type ReactNode } from "react";
import { useWalletPrivateAddressProviderState } from "./use-wallet-private-address-provider-state";
import { WalletPrivateAddressContext } from "./wallet-private-address-context";

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
