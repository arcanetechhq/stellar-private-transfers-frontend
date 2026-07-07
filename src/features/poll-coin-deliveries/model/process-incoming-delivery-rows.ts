import type { AppDispatch } from "@/store";
import {
  addCoin,
  finalizeCoin,
  existingSpentCoinMatchesIncomingDelivery,
  type CoinData,
} from "@/entities/coin";
import { addSeenTag } from "@/entities/coin-deliveries";
import type { IncomingCoinDeliveryDto } from "@/entities/coin-deliveries";
import { upsertCoinWithMetadataToSdk } from "@/shared/lib/privacy-sdk/upsert-private-record.js";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";

interface DecryptedDeliveryCoin {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  amountDisplay: number;
}

async function markDeliveryProcessedInSdk(deliveryId: number): Promise<void> {
  const privacyClient = tryGetPrivacySdkClient();
  if (privacyClient) {
    await privacyClient.markDeliveryProcessed(deliveryId);
  }
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
        status: "pending",
      }),
    );
    await upsertCoinWithMetadataToSdk(
      {
        commitmentHex: decrypted.commitmentHex,
        coin: decrypted.coin,
        depositScalarHex: decrypted.depositScalarHex,
        precommitementHex: decrypted.precommitementHex,
        privateAddress: parameters.privateAddress,
        assetId: parameters.assetId,
        poolContract: parameters.poolContract,
        amountDisplay: decrypted.amountDisplay,
        status: "pending",
      },
      parameters.publicKey,
    );
    parameters.dispatch(finalizeCoin(decrypted.commitmentHex));
    parameters.dispatch(addSeenTag({ assetId: parameters.assetId, tagBase64: tagB64 }));
    await markDeliveryProcessedInSdk(row.id);
  }
}
