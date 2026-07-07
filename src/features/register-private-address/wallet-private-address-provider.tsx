import React, { type ReactNode } from "react";
import { useWalletPrivateAddressProviderState } from "./use-wallet-private-address-provider-state";
import { useRegisterPrivacyTransactResolvers } from "./use-register-privacy-transact-resolvers.js";
import { WalletPrivateAddressContext } from "./wallet-private-address-context";
import { RegistryRegistrationModal } from "./registry-registration-modal";

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
      <RegistryRegistrationModal
        open={value.registryRegistrationModalOpen}
        onClose={value.closeRegistryRegistrationModal}
        onRegistered={() => {
          value.closeRegistryRegistrationModal();
          void value.refreshRegistryStatus();
        }}
      />
    </WalletPrivateAddressContext.Provider>
  );
}
