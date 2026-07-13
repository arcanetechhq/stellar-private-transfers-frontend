import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import type { CoinWithMetadata } from "@/entities/coin";
import { tryGetPrivacySdkClient } from "./transact-context.js";

export function mapCoinWithMetadataToPrivateRecord(
  coin: CoinWithMetadata,
  ownerAddress: string,
): StellarPrivateRecord {
  return {
    id: coin.commitmentHex,
    owner: ownerAddress,
    asset: coin.assetId,
    amount: BigInt(coin.coin.value),
    consumed: coin.status === "spent",
    status: coin.status,
    poolContract: coin.poolContract,
    commitmentHex: coin.commitmentHex,
    privateAddress: coin.privateAddress,
    amountDisplay: coin.amountDisplay,
    coinNote: coin.coin,
    ...(coin.depositScalarHex
      ? { depositScalarHex: coin.depositScalarHex }
      : {}),
    ...(coin.precommitementHex
      ? { precommitementHex: coin.precommitementHex }
      : {}),
    ...(coin.txId ? { txHash: coin.txId } : {}),
  };
}

export async function upsertPrivateRecordToSdk(
  record: StellarPrivateRecord,
): Promise<void> {
  const client = tryGetPrivacySdkClient();
  if (!client) {
    return;
  }
  await client.upsertPrivateRecords([record]);
}

export async function upsertCoinWithMetadataToSdk(
  coin: CoinWithMetadata,
  ownerAddress: string | undefined,
): Promise<void> {
  const trimmedOwner = ownerAddress?.trim();
  if (!trimmedOwner) {
    return;
  }
  await upsertPrivateRecordToSdk(
    mapCoinWithMetadataToPrivateRecord(coin, trimmedOwner),
  );
}
