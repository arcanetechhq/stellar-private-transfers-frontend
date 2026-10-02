import { createPrivateDataProvider } from "@arcanetech/privacy-sdk-data-layer";
import {
  STELLAR_OUTPUT_NOTE_DATA_TYPE,
  stellarOutputNoteRecordSchema,
  type StellarOutputNoteRecord,
} from "@arcanetech/privacy-sdk-stellar";
import type { AppDispatch } from "@/store";
import type { CoinData, CoinWithMetadata } from "@/entities/coin";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops";
import {
  processIncomingDeliveryRows,
  type AssessIncomingDeliveryPort,
} from "./process-incoming-delivery-rows.js";

type DecryptedOutputNote = {
  value: string;
  assetHi: string;
  assetLo: string;
  nullifier: string;
  secret: string;
  applicationId: string;
  commitmentHex: string;
};

export type DecryptOutputNote = (input: {
  recipientScalarHex: string;
  encryptedData: string;
  ephemeralX: string;
  ephemeralY: string;
}) => Promise<DecryptedOutputNote>;

type OutputNoteRow = {
  id: number;
  tag_base64: string;
  created_at: string;
  record: StellarOutputNoteRecord;
};

const COMMITMENT_TAG_LENGTH = 12;

function createOutputNoteProvider(origin: string) {
  return createPrivateDataProvider({
    origin,
    dataType: STELLAR_OUTPUT_NOTE_DATA_TYPE,
    recordSchema: stellarOutputNoteRecordSchema,
  });
}

async function decryptWithSdk(
  input: Parameters<DecryptOutputNote>[0],
): Promise<DecryptedOutputNote> {
  const { decryptStellarOutputNote } = await import(
    "@arcanetech/privacy-sdk-stellar/transact"
  );
  return decryptStellarOutputNote(input);
}

function coinFromNote(note: DecryptedOutputNote): CoinData {
  return {
    value: note.value,
    nullifier: note.nullifier,
    secret: note.secret,
    commitment: note.commitmentHex,
    asset_hi: note.assetHi,
    asset_lo: note.assetLo,
    application_id: note.applicationId,
  };
}

async function decryptRow(
  row: OutputNoteRow,
  recipientScalarHex: string,
  decryptNote: DecryptOutputNote,
) {
  try {
    const note = await decryptNote({
      recipientScalarHex,
      encryptedData: row.record.encryptedData,
      ephemeralX: row.record.ephemeralX,
      ephemeralY: row.record.ephemeralY,
    });
    const commitmentHex = note.commitmentHex.trim().toLowerCase();
    return {
      commitmentHex,
      coin: coinFromNote({ ...note, commitmentHex }),
      amountDisplay: stroopsToDisplayAmount(BigInt(note.value)),
      txId: `output-note-${commitmentHex.slice(0, COMMITMENT_TAG_LENGTH)}`,
    };
  } catch {
    return undefined;
  }
}

export async function receiveOutputNotes(input: {
  origin: string;
  privateAddress: string;
  lookupAsset: string;
  recipientScalarHex: string;
  assetId: string;
  poolContract: string;
  publicKey: string;
  seenTags: string[];
  coinItems: Parameters<typeof processIncomingDeliveryRows>[0]["coinItems"];
  localTransactionIds: string[];
  dispatch: AppDispatch;
  loadRecords?: () => Promise<readonly StellarOutputNoteRecord[]>;
  decryptNote?: DecryptOutputNote;
  assessIncomingNote?: AssessIncomingDeliveryPort;
  persistSpendableCoinToSdk?: (
    coin: CoinWithMetadata,
    publicKey: string,
  ) => Promise<void>;
}): Promise<void> {
  const loadRecords =
    input.loadRecords ??
    (async () => {
      const provider = createOutputNoteProvider(input.origin);
      return provider.find({
        privateAddress: input.privateAddress,
        asset: input.lookupAsset,
      });
    });
  const records = await loadRecords();
  const createdAt = new Date().toISOString();
  const rows: OutputNoteRow[] = records.map((record, index) => ({
    id: index,
    tag_base64: record.encryptedData,
    created_at: createdAt,
    record,
  }));
  const decryptNote = input.decryptNote ?? decryptWithSdk;
  await processIncomingDeliveryRows({
    rows,
    seenTags: input.seenTags,
    coinItems: input.coinItems,
    recipientScalarHex: input.recipientScalarHex,
    privateAddress: input.privateAddress,
    assetId: input.assetId,
    poolContract: input.poolContract,
    publicKey: input.publicKey,
    localTransactionIds: input.localTransactionIds,
    dispatch: input.dispatch,
    decryptDeliveryRow: (row, recipientScalarHex) =>
      decryptRow(row as OutputNoteRow, recipientScalarHex, decryptNote),
    ...(input.assessIncomingNote
      ? { assessIncomingNote: input.assessIncomingNote }
      : {}),
    markDeliveryProcessed: async () => undefined,
    ...(input.persistSpendableCoinToSdk
      ? { persistSpendableCoinToSdk: input.persistSpendableCoinToSdk }
      : {}),
  });
}
