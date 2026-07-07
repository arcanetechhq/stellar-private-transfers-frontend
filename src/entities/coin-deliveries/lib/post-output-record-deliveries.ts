import type { StellarPrivateRecord } from "@arcane/privacy-sdk-stellar";
import type { AppDispatch } from "@/store";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import { buildCoinDeliveryPostBody } from "./build-coin-delivery-post-body";
import { postCoinDeliveryBestEffort } from "./post-coin-delivery-best-effort";

type DeliverableOutputRecord = StellarPrivateRecord & {
  privateAddress: string;
  commitmentHex: string;
  coinNote: NonNullable<StellarPrivateRecord["coinNote"]>;
  depositScalarHex: string;
};

function isDeliverableOutputRecord(
  record: StellarPrivateRecord,
): record is DeliverableOutputRecord {
  return Boolean(
    record.privateAddress?.trim() &&
      record.commitmentHex &&
      record.coinNote &&
      record.depositScalarHex,
  );
}

export async function postOutputRecordDeliveries(parameters: {
  outputRecords: StellarPrivateRecord[];
  txId: string;
  dispatch: AppDispatch;
}): Promise<string | undefined> {
  const deliverable = parameters.outputRecords.filter(isDeliverableOutputRecord);
  const warnings: string[] = [];
  for (const record of deliverable) {
    const warning = await postCoinDeliveryBestEffort(parameters.dispatch, () =>
      buildCoinDeliveryPostBody({
        recipientPrivateAddressStpl1: record.privateAddress,
        commitmentHex: record.commitmentHex,
        coin: record.coinNote,
        depositScalarHex: record.depositScalarHex,
        precommitementHex: record.precommitementHex,
        assetId: record.asset,
        amountDisplay: stroopsToDisplayAmount(record.amount),
        txId: parameters.txId,
      }),
    );
    if (warning) {
      warnings.push(warning);
    }
  }
  return warnings.length > 0 ? warnings.join("; ") : undefined;
}
