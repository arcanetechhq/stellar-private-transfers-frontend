import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import * as StellarPrivacySdk from "@arcanetech/privacy-sdk-stellar";
import {
  stroopsToDisplayAmount,
  readStroopsBigInt,
} from "@/shared/lib/stellar/stroops.js";
import type { CoinWithMetadata } from "../model/coin.js";

type PrivacySdkStateRoot = { privacySdkState?: unknown };
type ReadPrivateRecordsFromSnapshot = (
  state: unknown,
) => StellarPrivateRecord[];

const readPrivateRecordsFromStateSnapshot = (
  StellarPrivacySdk as unknown as {
    readPrivateRecordsFromStateSnapshot?: ReadPrivateRecordsFromSnapshot;
  }
).readPrivateRecordsFromStateSnapshot;

function isPrivateRecordArray(value: unknown): value is StellarPrivateRecord[] {
  return Array.isArray(value);
}

export function readPrivateRecordsFromPrivacySdkBranch(
  branch: Record<string, unknown>,
): StellarPrivateRecord[] {
  const records = branch.privateRecords;
  if (!isPrivateRecordArray(records)) {
    return [];
  }
  return records.filter(
    (record): record is StellarPrivateRecord =>
      typeof record === "object" &&
      record !== null &&
      typeof record.id === "string" &&
      typeof record.commitmentHex === "string" &&
      record.coinNote !== undefined,
  );
}

export function readPrivateRecordsFromPrivacySdkState(
  state: PrivacySdkStateRoot,
): StellarPrivateRecord[] {
  if (readPrivateRecordsFromStateSnapshot) {
    return readPrivateRecordsFromStateSnapshot(state);
  }
  const branch = state.privacySdkState;
  if (typeof branch !== "object" || branch === null || Array.isArray(branch)) {
    return [];
  }
  return readPrivateRecordsFromPrivacySdkBranch(
    branch as Record<string, unknown>,
  );
}

function privateAddressFromRecord(
  record: StellarPrivateRecord,
): string | undefined {
  const explicit = record.privateAddress?.trim();
  if (explicit) {
    return explicit;
  }
  const owner = record.owner.trim();
  return owner.startsWith("stpl") ? owner : undefined;
}

function statusFromRecord(
  record: StellarPrivateRecord,
): CoinWithMetadata["status"] {
  if (record.status === "pending" && !record.txHash) {
    return "finalized";
  }
  if (
    record.status === "pending" ||
    record.status === "finalized" ||
    record.status === "spent"
  ) {
    return record.status;
  }
  return record.consumed ? "spent" : "finalized";
}

export function mapPrivateRecordToCoinWithMetadata(
  record: StellarPrivateRecord,
): CoinWithMetadata | undefined {
  const privateAddress = privateAddressFromRecord(record);
  if (!record.coinNote || !record.commitmentHex || !privateAddress) {
    return undefined;
  }
  return {
    commitmentHex: record.commitmentHex,
    coin: record.coinNote,
    depositScalarHex: record.depositScalarHex,
    precommitementHex: record.precommitementHex,
    privateAddress,
    assetId: record.asset,
    poolContract: record.poolContract ?? "",
    amountDisplay:
      record.amountDisplay ??
      stroopsToDisplayAmount(readStroopsBigInt(record.amount)),
    status: statusFromRecord(record),
    txId: record.txHash,
  };
}

export function mapPrivateRecordsToCoinItems(
  branch: Record<string, unknown>,
): CoinWithMetadata[] {
  return readPrivateRecordsFromPrivacySdkBranch(branch)
    .map((record) => mapPrivateRecordToCoinWithMetadata(record))
    .filter((item): item is CoinWithMetadata => item !== undefined);
}

export function mapPrivateRecordsToCoinItemsFromSdkState(
  state: PrivacySdkStateRoot,
): CoinWithMetadata[] {
  const records = readPrivateRecordsFromPrivacySdkState(state);
  return records
    .map((record) => mapPrivateRecordToCoinWithMetadata(record))
    .filter((item): item is CoinWithMetadata => item !== undefined);
}
