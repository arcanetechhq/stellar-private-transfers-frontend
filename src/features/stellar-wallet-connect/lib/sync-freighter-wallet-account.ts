import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import type { AppDispatch } from "@/store";
import { FREIGHTER_WALLET_ID } from "./wallet-options";
import { connectFreighterWallet } from "./connect-freighter-wallet";
import { disconnectStellarWallet } from "../model/stellar-wallet-thunks";

export type SyncFreighterWalletResult = "unchanged" | "changed" | "failed";

export async function syncFreighterWalletAccount(parameters: {
  dispatch: AppDispatch;
  currentPublicKey: string | undefined;
}): Promise<SyncFreighterWalletResult> {
  const current = parameters.currentPublicKey?.trim();

  try {
    StellarWalletsKitSdk.setWallet(FREIGHTER_WALLET_ID);
    const { address } = await StellarWalletsKitSdk.fetchAddress();
    const next = address.trim();
    if (!next) {
      return "failed";
    }

    if (current && next === current) {
      return "unchanged";
    }

    await parameters.dispatch(disconnectStellarWallet());
    const connected = await connectFreighterWallet(parameters.dispatch);
    return connected ? "changed" : "failed";
  } catch {
    return "failed";
  }
}
