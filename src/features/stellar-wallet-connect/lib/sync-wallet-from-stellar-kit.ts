import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { AppDispatch } from "@/app/store";
import { setPublicKey } from "@/entities/wallet";

export async function syncWalletFromStellarKitIfConnected(
  dispatch: AppDispatch,
): Promise<void> {
  try {
    const { address } = await StellarWalletsKit.getAddress();
    dispatch(setPublicKey(address));
  } catch {
    return;
  }
}
