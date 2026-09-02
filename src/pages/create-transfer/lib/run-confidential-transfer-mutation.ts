import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";
import { prepareTransferExecution } from "./run-confidential-transfer-prepare";
import type { TransferEscrowSend } from "@arcanetech/privacy-sdk-stellar/transact";

export type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";

export type RecipientTransferTarget = {
  recipientPrivateAddressStpl1: string;
  escrowSend?: TransferEscrowSend;
};

async function resolveRecipientTransferTarget(parameters: {
  recipientStellarAddress: string;
  walletPublicKey: string;
}): Promise<RecipientTransferTarget> {
  const privacyClient = getPrivacySdkClientOrThrow();
  const resolved = await privacyClient.resolveTransferRecipient({
    recipientStellarAddress: parameters.recipientStellarAddress,
    walletPublicKey: parameters.walletPublicKey,
  });
  return {
    recipientPrivateAddressStpl1: resolved.recipientPrivateAddressStpl1,
    ...(resolved.escrowSend ? { escrowSend: resolved.escrowSend } : {}),
  };
}

export async function runConfidentialTransferMutation(
  input: RunConfidentialTransferInput,
): Promise<RunConfidentialTransferResult> {
  const recipientTarget = await resolveRecipientTransferTarget({
    recipientStellarAddress: input.recipientStellarAddress.trim(),
    walletPublicKey: input.walletPublicKey,
  });
  return prepareTransferExecution({
    input,
    recipientTarget,
  });
}
