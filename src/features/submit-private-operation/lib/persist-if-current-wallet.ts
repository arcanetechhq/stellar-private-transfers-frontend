import { store } from "@/store/store.js";

export function persistIfCurrentWallet(
  walletPublicKey: string,
  persist: () => void,
): void {
  if (store.getState().wallet.publicKey?.trim() !== walletPublicKey.trim()) {
    return;
  }
  persist();
}
