import type { AppDispatch } from "@/store";
import { FREIGHTER_WALLET_ID } from "../lib/wallet-options";
import { connectStellarWalletModule } from "../model/stellar-wallet-thunks";

export async function connectFreighterWallet(
  dispatch: AppDispatch,
): Promise<string | undefined> {
  const result = await dispatch(connectStellarWalletModule(FREIGHTER_WALLET_ID));
  if (connectStellarWalletModule.fulfilled.match(result)) {
    return result.payload;
  }
  return undefined;
}
