import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { recordsFromDeliveryOutbox } from "./map-delivery-outbox.js";
import type { PendingPrivateOperation } from "./types.js";

export async function finalizeSdkStateForRelay(input: {
  operation: PendingPrivateOperation;
  txId: string;
}): Promise<void> {
  const client = getPrivacySdkClientOrThrow();
  const outputs = recordsFromDeliveryOutbox(input.operation.deliveryOutbox, {
    owner: input.operation.walletPublicKey,
    txId: input.txId,
  });
  if (outputs.length > 0) {
    await client.upsertPrivateRecords(outputs);
  }
  const consumed = input.operation.snapshot.consumedRecordIds.map((recordId) => ({
    id: recordId,
    owner: input.operation.walletPublicKey,
    asset: input.operation.display.assetId,
    amount: 0n,
    consumed: true,
    status: "spent" as const,
  }));
  if (consumed.length > 0) {
    await client.markPrivateRecordsStatus(consumed, "spent");
  }
}
