import { listStellarAssetWallets } from "../api/fireblocks-asset-wallets";
import type { StellarAssetWallet } from "../api/fireblocks-asset-wallets";
import {
  fireblocksEnvironmentFor,
  type FireblocksEnvironmentId,
} from "./fireblocks-environment";
import { saveFireblocksSession } from "./fireblocks-session";
import { resolveSigningKey } from "./fireblocks-signing-key";
import { FireblocksWizardError } from "./fireblocks-wizard-error";

export type CredentialSubmitInput = {
  apiKey: string;
  pemText: string;
  environmentId: FireblocksEnvironmentId;
};

export async function submitCustodianCredentials(
  input: CredentialSubmitInput,
): Promise<StellarAssetWallet[]> {
  const apiKey = input.apiKey.trim();
  if (apiKey.length === 0) {
    throw new FireblocksWizardError("missing-api-key");
  }
  const environment = fireblocksEnvironmentFor(input.environmentId);
  const signingKey = await resolveSigningKey(input.pemText);
  saveFireblocksSession({
    apiKey,
    environmentId: environment.id,
    baseUrl: environment.baseUrl,
  });
  return listStellarAssetWallets({
    baseUrl: environment.baseUrl,
    apiKey,
    signingKey,
  });
}
