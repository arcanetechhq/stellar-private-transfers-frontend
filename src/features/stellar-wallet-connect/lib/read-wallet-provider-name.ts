import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

export function readWalletProviderNameFromKit(): string | undefined {
  try {
    const productName = StellarWalletsKit.selectedModule.productName.trim();
    return productName || undefined;
  } catch {
    return undefined;
  }
}
