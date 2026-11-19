import type { AppDispatch } from "@/store";
import { closeCustodianWalletConnectSession } from "./close-wallet-connect-session";
import { deleteCustodianPrivateData } from "./custodian-private-data";
import { readSelectedFireblocksAsset } from "./selected-fireblocks-asset";

export async function dropPreviousCustodianPrivateData(input: {
  dispatch: AppDispatch;
  nextAddress: string;
}): Promise<void> {
  const previous = readSelectedFireblocksAsset()?.address.trim() ?? "";
  const nextAddress = input.nextAddress.trim();
  if (previous.length === 0 || previous === nextAddress) {
    return;
  }
  await closeCustodianWalletConnectSession(previous);
  deleteCustodianPrivateData({
    dispatch: input.dispatch,
    publicKey: previous,
  });
}
