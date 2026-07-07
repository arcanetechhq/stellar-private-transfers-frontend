import { skipToken } from "@reduxjs/toolkit/query/react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  normalizeCommitmentHex,
  selectCoinItems,
  type CoinData,
} from "@/entities/coin";
import {
  selectIsTagsHydrated,
  selectSeenTagsForAsset,
  useGetIncomingDeliveriesQuery,
  type IncomingCoinDeliveryDto,
} from "@/entities/coin-deliveries";
import { selectWalletPublicKey } from "@/entities/wallet";
import { base64ToBytes } from "@/shared/lib/base64-to-bytes";
import {
  tagFromCiphertextBytes,
  decryptCoinPayload,
  parseCoinDeliveryPayloadV1,
  DEFAULT_BLOOM_K,
  DEFAULT_BLOOM_M,
} from "@/shared/lib/coin-delivery";
import { getPrivacyPoolService } from "@/shared/lib/privacy-sdk/index.js";
import { useBloomBitsForSeenTags } from "./use-bloom-bits-for-seen-tags";
import { processIncomingDeliveryRows } from "./process-incoming-delivery-rows.js";

const POLL_INTERVAL_MS = 12_000;

async function verifyTagIntegrity(
  cipherBytes: Uint8Array,
  tagB64: string,
): Promise<boolean> {
  const expectedTag = await tagFromCiphertextBytes(cipherBytes);
  const rowTagBytes = base64ToBytes(tagB64);
  if (expectedTag.length !== rowTagBytes.length) return false;
  for (const [index, byte] of expectedTag.entries()) {
    if (byte !== rowTagBytes[index]) return false;
  }
  return true;
}

interface DecryptedDeliveryCoin {
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex?: string;
  precommitementHex?: string;
  amountDisplay: number;
}

async function decryptDeliveryRow(
  row: IncomingCoinDeliveryDto,
  recipientScalarHex: string,
): Promise<DecryptedDeliveryCoin | undefined> {
  const cipherBytes = base64ToBytes(row.ciphertext_base64);
  if (!(await verifyTagIntegrity(cipherBytes, row.tag_base64.trim())))
    return undefined;
  let sharedX: string;
  try {
    sharedX = await getPrivacyPoolService().sharedSecretX(
      recipientScalarHex,
      row.ephemeral_key,
    );
  } catch {
    return undefined;
  }
  let plaintext: string;
  try {
    plaintext = await decryptCoinPayload(sharedX, cipherBytes);
  } catch {
    return undefined;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(plaintext) as unknown;
  } catch {
    return undefined;
  }
  const v1 = parseCoinDeliveryPayloadV1(parsed);
  if (!v1) return undefined;
  const commitmentHex = normalizeCommitmentHex(v1.commitmentHex);
  if (!commitmentHex) return undefined;
  return {
    commitmentHex,
    coin: v1.coin,
    depositScalarHex: v1.depositScalarHex,
    precommitementHex: v1.precommitementHex,
    amountDisplay: v1.amountDisplay,
  };
}

export interface UsePollAssetDeliveriesParameters {
  privateAddress: string;
  recipientScalarHex: string;
  assetId: string;
  poolContract: string;
  pollingEnabled?: boolean;
}

export function usePollAssetDeliveries({
  privateAddress,
  recipientScalarHex,
  assetId,
  poolContract,
  pollingEnabled = true,
}: UsePollAssetDeliveriesParameters): void {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const seenTags = useAppSelector(selectSeenTagsForAsset(assetId));
  const coinItems = useAppSelector(selectCoinItems);
  const isTagsHydrated = useAppSelector(selectIsTagsHydrated);
  const bloomBitsBase64 = useBloomBitsForSeenTags(seenTags);
  const isSeenTagsBloomReady = bloomBitsBase64 !== undefined;

  const canPollIncomingDeliveries =
    pollingEnabled &&
    Boolean(privateAddress) &&
    Boolean(recipientScalarHex) &&
    Boolean(publicKey) &&
    isSeenTagsBloomReady &&
    isTagsHydrated;

  const { data } = useGetIncomingDeliveriesQuery(
    canPollIncomingDeliveries
      ? {
          privateAddress,
          assetId,
          bloomM: DEFAULT_BLOOM_M,
          bloomK: DEFAULT_BLOOM_K,
          ...(bloomBitsBase64 !== undefined && { bloomBitsBase64 }),
        }
      : skipToken,
    { pollingInterval: POLL_INTERVAL_MS },
  );

  useEffect(() => {
    if (!data || !publicKey) {
      return;
    }
    void processIncomingDeliveryRows({
      rows: data.data,
      seenTags,
      coinItems,
      recipientScalarHex,
      privateAddress,
      assetId,
      poolContract,
      publicKey,
      dispatch,
      decryptDeliveryRow,
    });
  }, [
    data,
    publicKey,
    seenTags,
    coinItems,
    recipientScalarHex,
    assetId,
    poolContract,
    privateAddress,
    dispatch,
  ]);
}
