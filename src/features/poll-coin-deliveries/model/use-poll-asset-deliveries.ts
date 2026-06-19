import { skipToken } from "@reduxjs/toolkit/query/react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  useGetIncomingDeliveriesQuery,
  addSeenTag,
  existingSpentCoinMatchesIncomingDelivery,
  selectSeenTagsForAsset,
  type IncomingCoinDeliveryDto,
  selectIsTagsHydrated,
} from "@/entities/coin-deliveries";
import {
  addCoin,
  finalizeCoin,
  normalizeCommitmentHex,
  selectCoinItems,
  type CoinData,
} from "@/entities/coin";
import {
  tagFromCiphertextBytes,
  decryptCoinPayload,
  parseCoinDeliveryPayloadV1,
  DEFAULT_BLOOM_K,
  DEFAULT_BLOOM_M,
} from "@/shared/lib/coin-delivery";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  base64ToBytes,
  useBloomBitsForSeenTags,
} from "@/features/poll-coin-deliveries";

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
    sharedX = await privacyPoolService.sharedSecretX(
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
    if (!data || !publicKey) return;
    const processRows = async () => {
      for (const row of data.data) {
        const tagB64 = row.tag_base64.trim();
        if (seenTags.includes(tagB64)) continue;
        const decrypted = await decryptDeliveryRow(row, recipientScalarHex);
        if (!decrypted) continue;
        if (
          existingSpentCoinMatchesIncomingDelivery(coinItems, {
            commitmentHex: decrypted.commitmentHex,
            coinCommitment: decrypted.coin.commitment,
          })
        ) {
          dispatch(addSeenTag({ assetId, tagBase64: tagB64 }));
          continue;
        }
        dispatch(
          addCoin({
            commitmentHex: decrypted.commitmentHex,
            coin: decrypted.coin,
            depositScalarHex: decrypted.depositScalarHex,
            precommitementHex: decrypted.precommitementHex,
            privateAddress,
            assetId,
            poolContract,
            amountDisplay: decrypted.amountDisplay,
            status: "pending",
          }),
        );
        dispatch(finalizeCoin(decrypted.commitmentHex));
        dispatch(addSeenTag({ assetId, tagBase64: tagB64 }));
      }
    };
    void processRows();
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
