import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";
import type { CoinWithMetadata } from "../model/coin.js";
import { mapCoinWithMetadataToPrivateRecord } from "@/shared/lib/privacy-sdk/upsert-private-record.js";

export { mapCoinWithMetadataToPrivateRecord } from "@/shared/lib/privacy-sdk/upsert-private-record.js";

export async function syncCoinItemsToSdkState(
  items: CoinWithMetadata[],
  ownerAddress: string | undefined,
): Promise<void> {
  const client = tryGetPrivacySdkClient();
  const trimmedOwner = ownerAddress?.trim();
  if (!client || !trimmedOwner || items.length === 0) {
    return;
  }
  await client.upsertPrivateRecords(
    items.map((item) => mapCoinWithMetadataToPrivateRecord(item, trimmedOwner)),
  );
}

export async function upsertPrivateRecordToSdkState(
  record: StellarPrivateRecord,
): Promise<void> {
  const client = tryGetPrivacySdkClient();
  if (!client) {
    return;
  }
  await client.upsertPrivateRecords([record]);
}
