import type { AppDispatch } from "@/store";
import { addCoin, finalizeCoin } from "@/entities/coin/model/coin-slice.js";
import type { CoinData, CoinWithMetadata } from "@/entities/coin/model/coin.js";
import { findCoinItemByLedgerReference } from "@/entities/coin/lib/ledger-commitment.js";
import { addSeenTag } from "@/entities/coin-deliveries/model/coin-delivery.js";
import { addTransaction } from "@/entities/transaction/model/transaction.js";
import type {
  IncomingNoteAssessment,
  IncomingNoteDeadReason,
  IncomingNoteFields,
} from "./process-incoming-delivery-rows.js";

export interface IncomingDeliveryRow {
  id: number;
  tag_base64: string;
  created_at: string;
}

export interface DecryptedDeliveryCoin {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  amountDisplay: number;
  txId: string;
}

const INCOMING_TX_ID_FALLBACK = "incoming";

export function walletHoldsDecryptedNote(
  items: readonly CoinWithMetadata[],
  decrypted: DecryptedDeliveryCoin,
): boolean {
  return (
    findCoinItemByLedgerReference(items, decrypted.commitmentHex) !==
      undefined ||
    findCoinItemByLedgerReference(items, decrypted.coin.commitment) !==
      undefined
  );
}

export function noteFieldsFromCoin(coin: CoinData): IncomingNoteFields {
  return {
    value: coin.value,
    nullifier: coin.nullifier,
    secret: coin.secret,
    commitment: coin.commitment,
    asset_hi: coin.asset_hi,
    asset_lo: coin.asset_lo,
  };
}

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

export async function tryAssessWithPrivacyClient(input: {
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

export async function persistSpendableCoin(
  decrypted: DecryptedDeliveryCoin,
  parameters: {
    privateAddress: string;
    assetId: string;
    poolContract: string;
    publicKey: string;
    dispatch: AppDispatch;
    persistSpendableCoinToSdk?: (
      coin: CoinWithMetadata,
      publicKey: string,
    ) => Promise<void>;
  },
): Promise<void> {
  const persist =
    parameters.persistSpendableCoinToSdk ?? defaultPersistSpendableCoinToSdk;
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
  await persist(coinFields, parameters.publicKey);
  parameters.dispatch(finalizeCoin(decrypted.commitmentHex));
}

export function persistDeadOnArrivalCoin(
  decrypted: DecryptedDeliveryCoin,
  parameters: {
    reason: IncomingNoteDeadReason;
    privateAddress: string;
    assetId: string;
    poolContract: string;
    dispatch: AppDispatch;
  },
): void {
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
      deadReason: parameters.reason,
    }),
  );
}

export function recordIncomingTransferTransaction(parameters: {
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

export async function markDeliverySeen(parameters: {
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
