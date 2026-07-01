import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { ISupportedWallet } from "@creit-tech/stellar-wallets-kit/types";
import {
  FREIGHTER_WALLET_ID,
  LOBSTR_WALLET_ID,
} from "./wallet-options";

export const RECOMMENDED_WALLET_IDS = new Set([
  FREIGHTER_WALLET_ID,
  LOBSTR_WALLET_ID,
]);

export async function fetchSupportedStellarWallets(): Promise<
  ISupportedWallet[]
> {
  return StellarWalletsKit.refreshSupportedWallets();
}

export function buildSupportedWalletMap(
  wallets: ISupportedWallet[],
): Map<string, ISupportedWallet> {
  return new Map(wallets.map((wallet) => [wallet.id, wallet]));
}

export function listAdditionalSupportedWallets(
  wallets: ISupportedWallet[],
): ISupportedWallet[] {
  return wallets.filter((wallet) => !RECOMMENDED_WALLET_IDS.has(wallet.id));
}
