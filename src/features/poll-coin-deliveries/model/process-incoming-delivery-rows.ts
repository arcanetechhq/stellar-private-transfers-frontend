import type { AppDispatch } from "@/store";
import type { CoinWithMetadata } from "@/entities/coin/model/coin.js";
import {
  markDeliverySeen,
  noteFieldsFromCoin,
  persistDeadOnArrivalCoin,
  persistSpendableCoin,
  recordIncomingTransferTransaction,
  tryAssessWithPrivacyClient,
  walletHoldsDecryptedNote,
  type DecryptedDeliveryCoin,
  type IncomingDeliveryRow,
} from "./incoming-delivery-effects.js";

export type IncomingNoteDeadReason =
  | "commitment_mismatch"
  | "nullifier_consumed";

export type IncomingNoteAssessment =
  | { kind: "dead"; reason: IncomingNoteDeadReason }
  | { kind: "pending" }
  | { kind: "spendable" };

export interface IncomingNoteFields {
  value: string;
  nullifier: string;
  secret: string;
  commitment: string;
  asset_hi: string;
  asset_lo: string;
  application_id?: string;
}

export type AssessIncomingDeliveryPort = (input: {
  note: IncomingNoteFields;
  commitmentHex: string;
  privKeyScalarHex: string;
  walletPublicKey: string;
  poolContractId: string;
}) => Promise<IncomingNoteAssessment>;

interface ProcessIncomingParameters {
  rows: IncomingDeliveryRow[];
  seenTags: string[];
  coinItems: readonly CoinWithMetadata[];
  readCoinItems?: () => readonly CoinWithMetadata[];
  recipientScalarHex: string;
  privateAddress: string;
  assetId: string;
  poolContract: string;
  publicKey: string;
  localTransactionIds: string[];
  dispatch: AppDispatch;
  decryptDeliveryRow: (
    row: IncomingDeliveryRow,
    recipientScalarHex: string,
  ) => Promise<DecryptedDeliveryCoin | undefined>;
  assessIncomingNote?: AssessIncomingDeliveryPort;
  markDeliveryProcessed?: (deliveryId: number) => Promise<void>;
  persistSpendableCoinToSdk?: (
    coin: CoinWithMetadata,
    publicKey: string,
  ) => Promise<void>;
}

function liveCoinItems(
  parameters: ProcessIncomingParameters,
): readonly CoinWithMetadata[] {
  return parameters.readCoinItems?.() ?? parameters.coinItems;
}

async function acknowledgeHeldNote(input: {
  parameters: ProcessIncomingParameters;
  decrypted: DecryptedDeliveryCoin;
  row: IncomingDeliveryRow;
  tagB64: string;
}): Promise<boolean> {
  if (!walletHoldsDecryptedNote(liveCoinItems(input.parameters), input.decrypted)) {
    return false;
  }
  await markDeliverySeen({
    assetId: input.parameters.assetId,
    tagB64: input.tagB64,
    deliveryId: input.row.id,
    dispatch: input.parameters.dispatch,
    markDeliveryProcessed: input.parameters.markDeliveryProcessed,
  });
  return true;
}

async function applyIncomingAssessment(input: {
  parameters: ProcessIncomingParameters;
  decrypted: DecryptedDeliveryCoin;
  row: IncomingDeliveryRow;
  tagB64: string;
  assessment: IncomingNoteAssessment;
}): Promise<void> {
  const { parameters, decrypted, row } = input;
  if (input.assessment.kind === "pending") {
    recordIncomingTransferTransaction({
      decrypted,
      row,
      assetId: parameters.assetId,
      localTransactionIds: parameters.localTransactionIds,
      dispatch: parameters.dispatch,
      status: "pending",
    });
    return;
  }
  if (input.assessment.kind === "dead") {
    await persistDeadOnArrivalCoin(decrypted, {
      reason: input.assessment.reason,
      privateAddress: parameters.privateAddress,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      dispatch: parameters.dispatch,
    });
    recordIncomingTransferTransaction({
      decrypted,
      row,
      assetId: parameters.assetId,
      localTransactionIds: parameters.localTransactionIds,
      dispatch: parameters.dispatch,
      status: "failed",
      invalidIncomingReason: input.assessment.reason,
    });
  } else {
    await persistSpendableCoin(decrypted, {
      privateAddress: parameters.privateAddress,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      publicKey: parameters.publicKey,
      dispatch: parameters.dispatch,
      persistSpendableCoinToSdk: parameters.persistSpendableCoinToSdk,
    });
    recordIncomingTransferTransaction({
      decrypted,
      row,
      assetId: parameters.assetId,
      localTransactionIds: parameters.localTransactionIds,
      dispatch: parameters.dispatch,
      status: "completed",
    });
  }
  await markDeliverySeen({
    assetId: parameters.assetId,
    tagB64: input.tagB64,
    deliveryId: row.id,
    dispatch: parameters.dispatch,
    markDeliveryProcessed: parameters.markDeliveryProcessed,
  });
}

async function processIncomingDeliveryRow(
  row: IncomingDeliveryRow,
  parameters: ProcessIncomingParameters,
): Promise<void> {
  const tagB64 = row.tag_base64.trim();
  if (parameters.seenTags.includes(tagB64)) {
    return;
  }
  const decrypted = await parameters.decryptDeliveryRow(
    row,
    parameters.recipientScalarHex,
  );
  if (!decrypted) {
    return;
  }
  if (await acknowledgeHeldNote({ parameters, decrypted, row, tagB64 })) {
    return;
  }
  const assessment = await (
    parameters.assessIncomingNote ?? tryAssessWithPrivacyClient
  )({
    note: noteFieldsFromCoin(decrypted.coin),
    commitmentHex: decrypted.commitmentHex,
    privKeyScalarHex: parameters.recipientScalarHex,
    walletPublicKey: parameters.publicKey,
    poolContractId: parameters.poolContract,
  });
  if (await acknowledgeHeldNote({ parameters, decrypted, row, tagB64 })) {
    return;
  }
  await applyIncomingAssessment({
    parameters,
    decrypted,
    row,
    tagB64,
    assessment,
  });
}

export async function processIncomingDeliveryRows(
  parameters: ProcessIncomingParameters,
): Promise<void> {
  for (const row of parameters.rows) {
    await processIncomingDeliveryRow(row, parameters);
  }
}
