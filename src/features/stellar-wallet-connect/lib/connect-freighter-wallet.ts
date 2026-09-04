import { ensureEscrowTagsForWallet } from "@/features/discover-escrow-notes";
import type { AppDispatch } from "@/store";
import { FREIGHTER_WALLET_ID } from "../lib/wallet-options";
import { connectStellarWalletModule } from "../model/stellar-wallet-thunks";

export async function connectFreighterWallet(
  dispatch: AppDispatch,
): Promise<string | undefined> {
  const result = await dispatch(connectStellarWalletModule(FREIGHTER_WALLET_ID));
  if (result.type !== connectStellarWalletModule.fulfilled.type) {
    return undefined;
  }
  const address = result.payload;
  await ensureEscrowTagsForWallet(address);
  return address;
}
