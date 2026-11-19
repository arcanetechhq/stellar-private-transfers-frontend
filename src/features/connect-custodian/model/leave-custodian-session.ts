import type { AppDispatch } from "@/store";
import { beginCustodianIntent } from "./custodian-intent";
import { closeAllCustodianWalletConnectSessions } from "./close-wallet-connect-session";
import { deleteCustodianPrivateData } from "./custodian-private-data";
import { deleteSigningKey } from "./fireblocks-signing-key";
import {
  clearSelectedFireblocksAsset,
  readSelectedFireblocksAsset,
} from "./selected-fireblocks-asset";

function addressesToWipe(
  storedAddress: string | undefined,
  activeAddress: string | undefined,
): string[] {
  const addresses = [storedAddress?.trim() ?? "", activeAddress?.trim() ?? ""];
  return [...new Set(addresses.filter((address) => address.length > 0))];
}

export async function leaveCustodianSession(input: {
  dispatch: AppDispatch;
  fireblocksPublicKey: string | undefined;
}): Promise<void> {
  beginCustodianIntent();
  const storedAddress = readSelectedFireblocksAsset()?.address;
  const addresses = addressesToWipe(storedAddress, input.fireblocksPublicKey);
  await deleteSigningKey();
  clearSelectedFireblocksAsset();
  await closeAllCustodianWalletConnectSessions(storedAddress ?? input.fireblocksPublicKey);
  for (const address of addresses) {
    deleteCustodianPrivateData({
      dispatch: input.dispatch,
      publicKey: address,
    });
  }
}
