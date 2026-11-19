import {
  clearWallet,
  FIREBLOCKS_WALLET_PROVIDER,
  selectWalletProviderName,
  selectWalletPublicKey,
  type CustodianResumeResult,
} from "@/entities/wallet";
import { store, type AppDispatch } from "@/store";
import { publishCustodianResumeFailure } from "./custodian-resume-failure";
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
  const address = wallet.address.trim();
  try {
    await openCustodianXlmSession({ wallet, dispatch });
  } catch (error: unknown) {
    if (restoredFireblocksAddress() === address) {
      return "restored";
    }
    publishCustodianResumeFailure(error);
    if (selectWalletPublicKey(store.getState())?.trim() === address) {
      dispatch(clearWallet());
    }
    return "failed";
  }
  return restoredFireblocksAddress() === address ? "restored" : "failed";
}
