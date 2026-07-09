import type { AppDispatch } from "@/store";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import {
  getPendingClaimTransactionId,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import { addTransaction } from "@/entities/transaction";
import { validatePendingClaimOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import { executeSdkPendingClaimTransfer } from "@/shared/lib/privacy-sdk/execute-sdk-pending-claim-transfer.js";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";

export type RunPendingClaimMutationResult = {
  txId: string;
  amountDisplay: number;
  coinDeliveryWarning?: string;
};

export async function runPendingClaimMutation(parameters: {
  dispatch: AppDispatch;
  claim: PendingClaimItem;
  assetId: string;
  permanentPrivateAddress: string;
}): Promise<RunPendingClaimMutationResult> {
  const privacyClient = getPrivacySdkClientOrThrow();
  const senderTrim = parameters.permanentPrivateAddress.trim();
  await validatePendingClaimOperation(privacyClient, {
    claim: parameters.claim,
    recipientPrivateAddress: senderTrim,
    assetId: parameters.assetId,
  });

  const executed = await executeSdkPendingClaimTransfer({
    client: privacyClient,
    claim: parameters.claim,
    assetId: parameters.assetId,
    permanentPrivateAddress: senderTrim,
  });

  const amountDisplay = stroopsToDisplayAmount(
    BigInt(parameters.claim.noteValue),
  );
  const outputRecords = executed.outputRecord ? [executed.outputRecord] : [];
  const coinDeliveryWarning = await postOutputRecordDeliveries({
    outputRecords,
    txId: executed.operationId,
    dispatch: parameters.dispatch,
  });

  parameters.dispatch(
    addTransaction({
      id: getPendingClaimTransactionId(parameters.claim.id),
      date: parameters.claim.createdAt,
      type: "received",
      assetId: parameters.assetId,
      amount: amountDisplay,
      counterparty: parameters.claim.poolTxId,
      senderPrivateAddress: senderTrim,
      status: "completed",
      confirmationStatus: "none",
      disclosureStatus: "none",
    }),
  );

  return {
    txId: executed.operationId,
    amountDisplay,
    ...(coinDeliveryWarning ? { coinDeliveryWarning } : {}),
  };
}

export function readPendingClaimMutationError(error: unknown): string {
  const mapped = mapPrivacySdkError(error);
  return mapped === "Operation failed" ? "Could not claim pending note." : mapped;
}
