import type { AppDispatch } from "@/store";
import { addCoin, finalizeCoin } from "@/entities/coin/model/coin-slice.js";
import type { CoinData, CoinWithMetadata } from "@/entities/coin/model/coin.js";
import { findCoinItemByLedgerReference } from "@/entities/coin/lib/ledger-commitment.js";
import { addSeenTag } from "@/entities/coin-deliveries/model/coin-delivery.js";
import { addTransaction } from "@/entities/transaction/model/transaction.js";

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

interface IncomingDeliveryRow {
  id: number;
  tag_base64: string;
  created_at: string;
}

interface DecryptedDeliveryCoin {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  amountDisplay: number;
  txId: string;
}

export type AssessIncomingDeliveryPort = (input: {
  note: IncomingNoteFields;
  commitmentHex: string;
  privKeyScalarHex: string;
  walletPublicKey: string;
  poolContractId: string;
}) => Promise<IncomingNoteAssessment>;

const INCOMING_TX_ID_FALLBACK = "incoming";

function resolveIncomingTransferId(
  txId: string,
  deliveryRowId: number,
): string {
  const trimmed = txId.trim();
  if (trimmed && trimmed !== INCOMING_TX_ID_FALLBACK) {
    return trimmed;
  }
  return `coin-delivery-${deliveryRowId}`;
}

function noteFieldsFromCoin(coin: CoinData): IncomingNoteFields {
  return {
    value: coin.value,
    nullifier: coin.nullifier,
    secret: coin.secret,
    commitment: coin.commitment,
    asset_hi: coin.asset_hi,
    asset_lo: coin.asset_lo,
  };
}

async function tryAssessWithPrivacyClient(input: {
  note: IncomingNoteFields;
  commitmentHex: string;
  privKeyScalarHex: string;
  walletPublicKey: string;
  poolContractId: string;
}): Promise<IncomingNoteAssessment> {
  const { tryGetPrivacySdkClient } =
    await import("@/shared/lib/privacy-sdk/transact-context.js");
  const privacyClient = tryGetPrivacySdkClient();
  if (!privacyClient || !("assessIncomingNote" in privacyClient)) {
    return { kind: "pending" };
  }
  const assess = privacyClient.assessIncomingNote;
  if (typeof assess !== "function") {
    return { kind: "pending" };
  }
  return assess.call(privacyClient, input) as Promise<IncomingNoteAssessment>;
}

async function markDeliveryProcessedInSdk(
  deliveryId: number,
  markDeliveryProcessed?: (deliveryId: number) => Promise<void>,
): Promise<void> {
  if (markDeliveryProcessed) {
    await markDeliveryProcessed(deliveryId);
    return;
  }
  const { tryGetPrivacySdkClient } =
    await import("@/shared/lib/privacy-sdk/transact-context.js");
  const privacyClient = tryGetPrivacySdkClient();
  if (privacyClient) {
    await privacyClient.markDeliveryProcessed(deliveryId);
  }
}

async function defaultPersistSpendableCoinToSdk(
  coin: CoinWithMetadata,
  publicKey: string,
): Promise<void> {
  const { upsertCoinWithMetadataToSdk } =
    await import("@/shared/lib/privacy-sdk/upsert-private-record.js");
  await upsertCoinWithMetadataToSdk(coin, publicKey);
}

async function persistSpendableCoin(
  decrypted: DecryptedDeliveryCoin,
  parameters: {
    privateAddress: string;
    assetId: string;
    poolContract: string;
    publicKey: string;
    dispatch: AppDispatch;
    persistSpendableCoinToSdk: (
      coin: CoinWithMetadata,
      publicKey: string,
    ) => Promise<void>;
  },
): Promise<void> {
  const coinFields: CoinWithMetadata = {
    commitmentHex: decrypted.commitmentHex,
    coin: decrypted.coin,
    depositScalarHex: decrypted.depositScalarHex,
    precommitementHex: decrypted.precommitementHex,
    privateAddress: parameters.privateAddress,
    assetId: parameters.assetId,
    poolContract: parameters.poolContract,
    amountDisplay: decrypted.amountDisplay,
    status: "pending",
  };
  parameters.dispatch(addCoin(coinFields));
  await parameters.persistSpendableCoinToSdk(coinFields, parameters.publicKey);
  parameters.dispatch(finalizeCoin(decrypted.commitmentHex));
}

async function persistDeadOnArrivalCoin(
  decrypted: DecryptedDeliveryCoin,
  reason: IncomingNoteDeadReason,
  parameters: {
    privateAddress: string;
    assetId: string;
    poolContract: string;
    dispatch: AppDispatch;
  },
): Promise<void> {
  parameters.dispatch(
    addCoin({
      commitmentHex: decrypted.commitmentHex,
      coin: decrypted.coin,
      depositScalarHex: decrypted.depositScalarHex,
      precommitementHex: decrypted.precommitementHex,
      privateAddress: parameters.privateAddress,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      amountDisplay: decrypted.amountDisplay,
      status: "dead",
      deadReason: reason,
    }),
  );
}

function recordIncomingTransferTransaction(parameters: {
  decrypted: DecryptedDeliveryCoin;
  row: IncomingDeliveryRow;
  assetId: string;
  localTransactionIds: string[];
  dispatch: AppDispatch;
  status: "completed" | "failed" | "pending";
  invalidIncomingReason?: IncomingNoteDeadReason;
}): void {
  const { decrypted, row } = parameters;
  const isSelfInitiated = parameters.localTransactionIds.includes(
    decrypted.txId,
  );
  if (isSelfInitiated) {
    return;
  }
  parameters.dispatch(
    addTransaction({
      id: resolveIncomingTransferId(decrypted.txId, row.id),
      date: row.created_at,
      type: "received",
      assetId: parameters.assetId,
      amount: decrypted.amountDisplay,
      counterparty: decrypted.txId,
      status: parameters.status,
      confirmationStatus: "none",
      disclosureStatus: "none",
      ...(parameters.invalidIncomingReason
        ? { invalidIncomingReason: parameters.invalidIncomingReason }
        : {}),
    }),
  );
}

async function markDeliverySeen(parameters: {
  assetId: string;
  tagB64: string;
  deliveryId: number;
  dispatch: AppDispatch;
  markDeliveryProcessed?: (deliveryId: number) => Promise<void>;
}): Promise<void> {
  parameters.dispatch(
    addSeenTag({ assetId: parameters.assetId, tagBase64: parameters.tagB64 }),
  );
  await markDeliveryProcessedInSdk(
    parameters.deliveryId,
    parameters.markDeliveryProcessed,
  );
}

export async function processIncomingDeliveryRows(parameters: {
  rows: IncomingDeliveryRow[];
  seenTags: string[];
  coinItems: Parameters<typeof findCoinItemByLedgerReference>[0];
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
}): Promise<void> {
  const assess = parameters.assessIncomingNote ?? tryAssessWithPrivacyClient;
  const persistSpendableCoinToSdk =
    parameters.persistSpendableCoinToSdk ?? defaultPersistSpendableCoinToSdk;

  for (const row of parameters.rows) {
    const tagB64 = row.tag_base64.trim();
    if (parameters.seenTags.includes(tagB64)) {
      continue;
    }
    const decrypted = await parameters.decryptDeliveryRow(
      row,
      parameters.recipientScalarHex,
    );
    if (!decrypted) {
      continue;
    }
    if (
      findCoinItemByLedgerReference(
        parameters.coinItems,
        decrypted.commitmentHex,
      ) !== undefined ||
      findCoinItemByLedgerReference(
        parameters.coinItems,
        decrypted.coin.commitment,
      ) !== undefined
    ) {
      await markDeliverySeen({
        assetId: parameters.assetId,
        tagB64,
        deliveryId: row.id,
        dispatch: parameters.dispatch,
        markDeliveryProcessed: parameters.markDeliveryProcessed,
      });
      continue;
    }

    const assessment = await assess({
      note: noteFieldsFromCoin(decrypted.coin),
      commitmentHex: decrypted.commitmentHex,
      privKeyScalarHex: parameters.recipientScalarHex,
      walletPublicKey: parameters.publicKey,
      poolContractId: parameters.poolContract,
    });

    if (assessment.kind === "pending") {
      recordIncomingTransferTransaction({
        decrypted,
        row,
        assetId: parameters.assetId,
        localTransactionIds: parameters.localTransactionIds,
        dispatch: parameters.dispatch,
        status: "pending",
      });
      continue;
    }

    if (assessment.kind === "dead") {
      await persistDeadOnArrivalCoin(decrypted, assessment.reason, {
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
        invalidIncomingReason: assessment.reason,
      });
      await markDeliverySeen({
        assetId: parameters.assetId,
        tagB64,
        deliveryId: row.id,
        dispatch: parameters.dispatch,
        markDeliveryProcessed: parameters.markDeliveryProcessed,
      });
      continue;
    }

    await persistSpendableCoin(decrypted, {
      privateAddress: parameters.privateAddress,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      publicKey: parameters.publicKey,
      dispatch: parameters.dispatch,
      persistSpendableCoinToSdk,
    });
    recordIncomingTransferTransaction({
      decrypted,
      row,
      assetId: parameters.assetId,
      localTransactionIds: parameters.localTransactionIds,
      dispatch: parameters.dispatch,
      status: "completed",
    });
    await markDeliverySeen({
      assetId: parameters.assetId,
      tagB64,
      deliveryId: row.id,
      dispatch: parameters.dispatch,
      markDeliveryProcessed: parameters.markDeliveryProcessed,
    });
  }
}
