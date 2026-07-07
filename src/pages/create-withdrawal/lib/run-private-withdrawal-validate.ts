import type { StellarPrivacyClient } from "@arcane/privacy-sdk-stellar";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import { validateWithdrawOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import type { RunPrivateWithdrawalMutationInput } from "./private-withdrawal-mutation-contract";

export async function validatePrivateWithdrawOperationInput(parameters: {
  input: RunPrivateWithdrawalMutationInput;
  privacyClient: StellarPrivacyClient;
}): Promise<void> {
  await validateWithdrawOperation(parameters.privacyClient, {
    senderPrivateAddress: parameters.input.senderPrivateAddress.trim(),
    recipientPublicAddress: parameters.input.destinationAddress.trim(),
    assetId: parameters.input.assetId,
    amountStroops: displayAmountToStroops(parameters.input.amountDisplay),
  });
}
