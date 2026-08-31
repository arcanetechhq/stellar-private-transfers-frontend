import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import type { DeliveryOutboxEntry } from "@/shared/lib/protocol-relay/types.js";

export function deliveryOutboxFromRecords(
  records: StellarPrivateRecord[],
): DeliveryOutboxEntry[] {
  const entries: DeliveryOutboxEntry[] = [];
  for (const record of records) {
    if (
      !record.privateAddress?.trim() ||
      !record.commitmentHex ||
      !record.coinNote ||
      !record.depositScalarHex
    ) {
      continue;
    }
    const entry: DeliveryOutboxEntry = {
      recipientPrivateAddress: record.privateAddress,
      commitmentHex: record.commitmentHex,
      coinNote: { ...record.coinNote },
      depositScalarHex: record.depositScalarHex,
      assetId: record.asset,
      amountDisplay: record.amountDisplay ?? 0,
    };
    if (record.precommitementHex) {
      entry.precommitementHex = record.precommitementHex;
    }
    entries.push(entry);
  }
  return entries;
}

export function recordsFromDeliveryOutbox(
  entries: DeliveryOutboxEntry[],
  input: { owner: string; txId: string },
): StellarPrivateRecord[] {
  return entries.map((entry) => {
    const record: StellarPrivateRecord = {
      id: entry.commitmentHex,
      owner: input.owner,
      asset: entry.assetId,
      amount: BigInt(entry.coinNote.value ?? "0"),
      consumed: false,
      status: "finalized",
      commitmentHex: entry.commitmentHex,
      privateAddress: entry.recipientPrivateAddress,
      amountDisplay: entry.amountDisplay,
      coinNote: entry.coinNote as StellarPrivateRecord["coinNote"],
      depositScalarHex: entry.depositScalarHex,
      txHash: input.txId,
    };
    if (entry.precommitementHex) {
      record.precommitementHex = entry.precommitementHex;
    }
    return record;
  });
}
