import { clearWallet, selectWalletPublicKey } from "@/entities/wallet";
import { store, type AppDispatch } from "@/store";
import { closeAllCustodianWalletConnectSessions } from "./close-wallet-connect-session";
import { deleteCustodianPrivateData } from "./custodian-private-data";
import { deleteSigningKey } from "./fireblocks-signing-key";
import {
  clearSelectedFireblocksAsset,
  readSelectedFireblocksAsset,
} from "./selected-fireblocks-asset";

function clearMatchingWallet(dispatch: AppDispatch, previous: string): void {
  const current = selectWalletPublicKey(store.getState())?.trim() ?? "";
  if (current.length === 0 || current !== previous) {
    return;
  }
  dispatch(clearWallet());
}

export async function dropPreviousCustodianPrivateData(input: {
  dispatch: AppDispatch;
  nextAddress: string;
}): Promise<boolean> {
  const previous = readSelectedFireblocksAsset()?.address.trim() ?? "";
  const nextAddress = input.nextAddress.trim();
  if (previous.length === 0 || previous === nextAddress) {
    return false;
  }
  await deleteSigningKey();
  clearSelectedFireblocksAsset();
  await closeAllCustodianWalletConnectSessions(previous);
  deleteCustodianPrivateData({
    dispatch: input.dispatch,
    publicKey: previous,
  });
  clearMatchingWallet(input.dispatch, previous);
  return true;
}
