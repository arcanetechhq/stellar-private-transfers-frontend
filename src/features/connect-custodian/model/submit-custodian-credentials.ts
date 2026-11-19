import { listCustodianAssetWallets } from "../api/custodian-asset-wallets";
import type { StellarAssetWallet } from "./stellar-asset-wallet";
import { saveFireblocksSession } from "./fireblocks-session";
import { FireblocksWizardError } from "./fireblocks-wizard-error";

export type CredentialSubmitInput = {
  apiKey: string;
  pemText: string;
};

export async function submitCustodianCredentials(
  input: CredentialSubmitInput,
): Promise<StellarAssetWallet[]> {
  const apiKey = input.apiKey.trim();
  if (apiKey.length === 0) {
    throw new FireblocksWizardError("missing-api-key");
  }
  const wallets = await listCustodianAssetWallets({
    apiKey,
    privateKey: input.pemText.trim(),
  });
  saveFireblocksSession({ apiKey, pemAccepted: true });
  return wallets;
}
