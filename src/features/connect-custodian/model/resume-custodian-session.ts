import {
  FIREBLOCKS_WALLET_PROVIDER,
  selectWalletProviderName,
  selectWalletPublicKey,
} from "@/entities/wallet";
import type { CustodianResumeResult } from "@/shared/lib/wallet/custodian-session-port";
import { store, type AppDispatch } from "@/store";
import {
  isFireblocksTestXlm,
  openCustodianXlmSession,
} from "./open-custodian-xlm-session";
import { readSelectedFireblocksAsset } from "./selected-fireblocks-asset";

function restoredFireblocksAddress(): string | undefined {
  const state = store.getState();
  if (selectWalletProviderName(state) !== FIREBLOCKS_WALLET_PROVIDER) {
    return undefined;
  }
  return selectWalletPublicKey(state)?.trim();
}

export async function resumeCustodianSession(
  dispatch: AppDispatch,
): Promise<CustodianResumeResult> {
  const wallet = readSelectedFireblocksAsset();
  if (!wallet || !isFireblocksTestXlm(wallet)) {
    return "absent";
  }
  try {
    await openCustodianXlmSession({ wallet, dispatch });
  } catch {
    return "failed";
  }
  return restoredFireblocksAddress() === wallet.address.trim()
    ? "restored"
    : "failed";
}
