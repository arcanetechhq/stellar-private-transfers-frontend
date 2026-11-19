import { clearSeenTags } from "@/entities/coin-deliveries";
import { clearPrivateAddressState } from "@/entities/private-address";
import { clearPrivacySdkState } from "@/entities/privacy-sdk-state";
import { selectWalletPublicKey } from "@/entities/wallet";
import { resetWalletScopedState, store, type AppDispatch } from "@/store";

function clearLoadedPrivateData(dispatch: AppDispatch, publicKey: string): void {
  const current = selectWalletPublicKey(store.getState())?.trim();
  if (current !== publicKey) {
    return;
  }
  resetWalletScopedState(dispatch);
}

export function deleteCustodianPrivateData(input: {
  dispatch: AppDispatch;
  publicKey: string;
}): void {
  const publicKey = input.publicKey.trim();
  if (publicKey.length === 0) {
    return;
  }
  clearLoadedPrivateData(input.dispatch, publicKey);
  clearPrivacySdkState(publicKey);
  clearSeenTags(publicKey);
  clearPrivateAddressState(publicKey);
}
