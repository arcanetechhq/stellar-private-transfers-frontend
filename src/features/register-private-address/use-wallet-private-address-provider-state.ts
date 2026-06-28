import { useMemo } from "react";
import { useWalletPrivateAddressModel } from "./use-wallet-private-address-model";
import { useWalletRegistryStatusModel } from "./use-wallet-registry-status-model";
import type { WalletPrivateAddressContextValue } from "./wallet-private-address-context";

export function useWalletPrivateAddressProviderState(): WalletPrivateAddressContextValue {
  const registry = useWalletRegistryStatusModel();
  const wallet = useWalletPrivateAddressModel();
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
    }),
    [registry, wallet],
  );
}
