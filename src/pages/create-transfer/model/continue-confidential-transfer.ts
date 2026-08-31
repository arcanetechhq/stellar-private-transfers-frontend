import { continuePrivateOperation } from "@/features/submit-private-operation";
import {
  readRelayAction,
  type RelayActionState,
} from "@/shared/lib/protocol-relay";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import type {
  ConfidentialTransferSubmitParameters,
  RelayActionControls,
} from "./confirm-confidential-transfer";
import { readConfidentialTransferSubmitError } from "./confidential-transfer-submit-flow";

export async function continueConfidentialTransfer(input: {
  parameters: ConfidentialTransferSubmitParameters;
  controls: RelayActionControls;
  relayAction: RelayActionState | undefined;
  action: "retry" | "fallback";
}): Promise<void> {
  if (!input.relayAction || !input.parameters.walletPublicKey.trim()) {
    return;
  }
  input.parameters.setIsSubmitting(true);
  input.controls.setSubmitError(undefined);
  try {
    const result = await continuePrivateOperation({
      dispatch: input.parameters.dispatch,
      walletPublicKey: input.parameters.walletPublicKey,
      operationId: input.relayAction.operationId,
      action: input.action,
    });
    input.parameters.onSuccess?.({
      txId: result.txId,
      amount: input.parameters.numericAmount,
      assetId: input.parameters.selectedAsset?.assetId ?? "",
      recipient: input.parameters.recipientTrim,
      poolContract: getRequiredPrivacyPoolContractId(),
      coinDeliveryWarning: result.coinDeliveryWarning,
    });
  } catch (error: unknown) {
    input.controls.setSubmitError(readConfidentialTransferSubmitError(error));
    input.controls.setRelayAction(readRelayAction(error) ?? input.relayAction);
  } finally {
    input.parameters.setIsSubmitting(false);
  }
}
