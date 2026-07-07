import React, { type ReactNode } from "react";
import { useWalletPrivateAddressProviderState } from "./use-wallet-private-address-provider-state";
import { useRegisterPrivacyTransactResolvers } from "./use-register-privacy-transact-resolvers.js";
import { WalletPrivateAddressContext } from "./wallet-private-address-context";

export function WalletPrivateAddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useWalletPrivateAddressProviderState();
  useRegisterPrivacyTransactResolvers();
  return (
    <WalletPrivateAddressContext.Provider value={value}>
      {children}
    </WalletPrivateAddressContext.Provider>
  );
}
