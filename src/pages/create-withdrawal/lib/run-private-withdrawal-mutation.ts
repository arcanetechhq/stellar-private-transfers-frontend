import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import {
  mapPrivacySdkError,
  mapPrivacySdkErrors,
} from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";
import { validatePrivateWithdrawOperationInput } from "./run-private-withdrawal-validate";

export type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";

export async function runPrivateWithdrawalMutation(
  input: RunPrivateWithdrawalMutationInput,
): Promise<RunPrivateWithdrawalMutationResult> {
  const privacyClient = getPrivacySdkClientOrThrow();
  await privacyClient.syncPoolMerkleState({
    poolContractId: getRequiredPrivacyPoolContractId(),
    walletPublicKey: input.walletPublicKey,
  });
  await validatePrivateWithdrawOperationInput({ input, privacyClient });
  const operation = await privacyClient.withdraw({
    from: input.senderPrivateAddress.trim(),
    to: input.destinationAddress.trim(),
    asset: input.assetId,
    amount: displayAmountToStroops(input.amountDisplay),
    disclosure: {
      senderAddress: "private",
      recipientAddress: "public",
      assetAddress: "public",
      amount: "public",
    },
  });
  if (operation.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(operation.errors));
  }
  try {
    const receipt = await operation.execute();
    const txId = receipt.operationId;
    if (!txId) {
      throw new Error("Withdrawal transaction did not return an operation id");
    }
    const coinDeliveryWarning = await postOutputRecordDeliveries({
      outputRecords: operation.prepared.outputRecords,
      txId,
      dispatch: input.dispatch,
    });
    return { txId, ...(coinDeliveryWarning ? { coinDeliveryWarning } : {}) };
  } catch (error: unknown) {
    throw new Error(mapPrivacySdkError(error));
  }
}
