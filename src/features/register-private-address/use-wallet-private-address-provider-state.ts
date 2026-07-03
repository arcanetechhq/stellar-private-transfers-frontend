import { useCallback, useMemo, useState } from "react";
import {
  isWalletRegistryChecking,
  isWalletRegistryRegistered,
} from "./registry-status-display";
import { useWalletPrivateAddressModel } from "./use-wallet-private-address-model";
import { useWalletRegistryStatusModel } from "./use-wallet-registry-status-model";
import type { WalletPrivateAddressContextValue } from "./wallet-private-address-context";

export function useWalletPrivateAddressProviderState(): WalletPrivateAddressContextValue {
  const registry = useWalletRegistryStatusModel();
  const wallet = useWalletPrivateAddressModel();
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const isRegistered = isWalletRegistryRegistered(registry.registryStatus);
  const isChecking = isWalletRegistryChecking(
    registry.registryStatus,
    registry.isRegistryLoading,
  );
  const canOpenRegistryRegistration = !isRegistered && !isChecking;

  const openRegistryRegistrationModal = useCallback(() => {
    if (!canOpenRegistryRegistration) {
      return;
    }
    setRegistrationModalOpen(true);
  }, [canOpenRegistryRegistration]);

  const closeRegistryRegistrationModal = useCallback(() => {
    setRegistrationModalOpen(false);
  }, []);

  return useMemo(
    () => ({
      registryStatus: registry.registryStatus,
      isRegistryLoading: registry.isRegistryLoading,
      actionsEnabled: registry.actionsEnabled,
      privateAddressStpl1: wallet.privateAddressStpl1,
      scalarHex: wallet.scalarHex,
      defaultNonce: wallet.defaultNonce,
      refreshRegistryStatus: registry.refreshRegistryStatus,
      ensureWalletPrivateAddress: wallet.ensureWalletPrivateAddress,
      ensureWalletScalar: wallet.ensureWalletScalar,
      registryRegistrationModalOpen:
        registrationModalOpen && canOpenRegistryRegistration,
      canOpenRegistryRegistration,
      openRegistryRegistrationModal,
      closeRegistryRegistrationModal,
    }),
    [
      registry,
      wallet,
      registrationModalOpen,
      canOpenRegistryRegistration,
      openRegistryRegistrationModal,
      closeRegistryRegistrationModal,
    ],
  );
}
