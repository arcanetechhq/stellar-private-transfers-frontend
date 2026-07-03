import type { WalletRegistryStatus } from "./wallet-private-address-context";

export function isWalletRegistryRegistered(
  status: WalletRegistryStatus,
): boolean {
  return status === "active";
}

export function isWalletRegistryChecking(
  status: WalletRegistryStatus,
  isRegistryLoading: boolean,
): boolean {
  return isRegistryLoading || status === "checking";
}

export function registryStatusLabel(
  status: WalletRegistryStatus,
  translate: (key: string) => string,
): string {
  if (isWalletRegistryRegistered(status)) {
    return translate("registryStatusActive");
  }
  return translate("registryStatusUnregistered");
}

export function registryStatusTone(
  status: WalletRegistryStatus,
): "success" | "warning" {
  if (isWalletRegistryRegistered(status)) {
    return "success";
  }
  return "warning";
}
