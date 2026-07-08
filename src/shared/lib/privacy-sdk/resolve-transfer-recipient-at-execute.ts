import { getPrivacySdkClientOrThrow } from "./transact-context.js";
import type { TransferRecipientExecutionContext } from "@arcanetech/privacy-sdk-stellar/transact";

export async function resolveTransferRecipientAtExecute(input: {
  recipientStellarAddress: string;
  walletPublicKey: string;
}): Promise<TransferRecipientExecutionContext> {
  const privacyClient = getPrivacySdkClientOrThrow();
  return privacyClient.resolveTransferRecipient({
    recipientStellarAddress: input.recipientStellarAddress,
    walletPublicKey: input.walletPublicKey,
  });
}

export { buildTransferOnboardingAtExecute } from "@arcanetech/privacy-sdk-stellar/transact";
