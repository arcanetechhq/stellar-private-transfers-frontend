import type { AppDispatch } from "@/store";
import {
  addCoin,
  finalizeCoin,
  existingSpentCoinMatchesIncomingDelivery,
  type CoinData,
} from "@/entities/coin";
import { addSeenTag } from "@/entities/coin-deliveries";
import type { IncomingCoinDeliveryDto } from "@/entities/coin-deliveries";
import { addTransaction } from "@/entities/transaction";
import { upsertCoinWithMetadataToSdk } from "@/shared/lib/privacy-sdk/upsert-private-record.js";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";

interface DecryptedDeliveryCoin {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  amountDisplay: number;
  txId: string;
}

const INCOMING_TX_ID_FALLBACK = "incoming";

function resolveIncomingTransferId(txId: string, deliveryRowId: number): string {
  const trimmed = txId.trim();
  if (trimmed && trimmed !== INCOMING_TX_ID_FALLBACK) {
    return trimmed;
  }
  return `coin-delivery-${deliveryRowId}`;
}

async function markDeliveryProcessedInSdk(deliveryId: number): Promise<void> {
  const privacyClient = tryGetPrivacySdkClient();
  if (privacyClient) {
    await privacyClient.markDeliveryProcessed(deliveryId);
  }
}

async function persistDecryptedCoin(
  decrypted: DecryptedDeliveryCoin,
  parameters: {
    privateAddress: string;
    assetId: string;
    poolContract: string;
    publicKey: string;
    dispatch: AppDispatch;
  },
): Promise<void> {
  const coinFields = {
    commitmentHex: decrypted.commitmentHex,
    coin: decrypted.coin,
    depositScalarHex: decrypted.depositScalarHex,
    precommitementHex: decrypted.precommitementHex,
    privateAddress: parameters.privateAddress,
    assetId: parameters.assetId,
    poolContract: parameters.poolContract,
    amountDisplay: decrypted.amountDisplay,
    status: "pending" as const,
  };
  parameters.dispatch(addCoin(coinFields));
  await upsertCoinWithMetadataToSdk(coinFields, parameters.publicKey);
  parameters.dispatch(finalizeCoin(decrypted.commitmentHex));
}

function recordIncomingTransferTransaction(parameters: {
  decrypted: DecryptedDeliveryCoin;
  row: IncomingCoinDeliveryDto;
  assetId: string;
  localTransactionIds: string[];
  dispatch: AppDispatch;
}): void {
  const { decrypted, row } = parameters;
  const isSelfInitiated = parameters.localTransactionIds.includes(decrypted.txId);
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
      status: "completed",
      confirmationStatus: "none",
      disclosureStatus: "none",
    }),
  );
}

export async function processIncomingDeliveryRows(parameters: {
  rows: IncomingCoinDeliveryDto[];
  seenTags: string[];
  coinItems: Parameters<typeof existingSpentCoinMatchesIncomingDelivery>[0];
  recipientScalarHex: string;
  privateAddress: string;
  assetId: string;
  poolContract: string;
  publicKey: string;
  localTransactionIds: string[];
  dispatch: AppDispatch;
  decryptDeliveryRow: (
    row: IncomingCoinDeliveryDto,
    recipientScalarHex: string,
  ) => Promise<DecryptedDeliveryCoin | undefined>;
}): Promise<void> {
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
      existingSpentCoinMatchesIncomingDelivery(parameters.coinItems, {
        commitmentHex: decrypted.commitmentHex,
        coinCommitment: decrypted.coin.commitment,
      })
    ) {
      parameters.dispatch(addSeenTag({ assetId: parameters.assetId, tagBase64: tagB64 }));
      await markDeliveryProcessedInSdk(row.id);
      continue;
    }
    await persistDecryptedCoin(decrypted, {
      privateAddress: parameters.privateAddress,
      assetId: parameters.assetId,
      poolContract: parameters.poolContract,
      publicKey: parameters.publicKey,
      dispatch: parameters.dispatch,
    });
    recordIncomingTransferTransaction({
      decrypted,
      row,
      assetId: parameters.assetId,
      localTransactionIds: parameters.localTransactionIds,
      dispatch: parameters.dispatch,
    });
    parameters.dispatch(addSeenTag({ assetId: parameters.assetId, tagBase64: tagB64 }));
    await markDeliveryProcessedInSdk(row.id);
  }
}
