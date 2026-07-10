import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { STELLAR_NETWORK_PASSPHRASE } from "@/shared/stellar/horizon-server";
import { WalletNetworkMismatchError } from "./wallet-network-mismatch-error";

export async function ensureWalletNetworkMatchesApp(): Promise<void> {
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  if (networkPassphrase === STELLAR_NETWORK_PASSPHRASE) {
    return;
  }

  throw new WalletNetworkMismatchError({
    walletNetworkPassphrase: networkPassphrase,
    expectedNetworkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  });
}
