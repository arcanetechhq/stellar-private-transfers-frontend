import { continuePrivateOperation } from "@/features/submit-private-operation";
import { readRelayAction, type RelayActionState } from "@/shared/lib/protocol-relay";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import {
  readWithdrawalSubmitError,
  type PrivateWithdrawalSubmitParameters,
  type WithdrawalRelayControls,
} from "./confirm-private-withdrawal";

export async function continuePrivateWithdrawal(input: {
  parameters: PrivateWithdrawalSubmitParameters;
  controls: WithdrawalRelayControls;
  relayAction: RelayActionState | undefined;
  action: "retry" | "fallback";
}): Promise<void> {
  if (!input.relayAction || !input.parameters.connectedPublicKey.trim()) {
    return;
  }
  input.parameters.setIsSubmitting(true);
  input.controls.setSubmitError(undefined);
  try {
    const result = await continuePrivateOperation({
      dispatch: input.parameters.dispatch,
      walletPublicKey: input.parameters.connectedPublicKey,
      operationId: input.relayAction.operationId,
      action: input.action,
    });
    input.parameters.onSuccess?.({
      txId: result.txId,
      amount: input.parameters.numericAmount,
      assetId: input.parameters.selectedAsset?.assetId ?? "",
      destination: input.parameters.destinationTrim,
      poolContract: getRequiredPrivacyPoolContractId(),
      coinDeliveryWarning: result.coinDeliveryWarning,
    });
  } catch (error: unknown) {
    input.controls.setSubmitError(readWithdrawalSubmitError(error));
    input.controls.setRelayAction(readRelayAction(error) ?? input.relayAction);
  } finally {
    input.parameters.setIsSubmitting(false);
  }
}
