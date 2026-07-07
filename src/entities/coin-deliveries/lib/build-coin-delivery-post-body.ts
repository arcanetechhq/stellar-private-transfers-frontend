import type { CoinData } from "@/shared/lib/privacy-sdk/types.js";
import {
  encryptCoinPayload,
  tagFromCiphertextBytes,
} from "@/shared/lib/coin-delivery";
import {
  COIN_DELIVERY_PAYLOAD_VERSION,
  stringifyCoinDeliveryPayloadV1,
  type CoinDeliveryPayloadV1,
} from "@/shared/lib/coin-delivery/payload-v1";
import {
  encodeEphemeralKeyFromDepositScalar,
  getPrivacyPoolService,
  sharedSecretFromDepositorPreimage,
} from "@/shared/lib/privacy-sdk/index.js";
import type { PostCoinDeliveryBody } from "../api/coin-delivery-api";

const BASE64_CHUNK = 8192;

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += BASE64_CHUNK) {
    const chunk = bytes.subarray(index, index + BASE64_CHUNK);
    for (const code of chunk) {
      binary += String.fromCodePoint(code);
    }
  }
  return btoa(binary);
}

export interface BuildCoinDeliveryPostBodyInput {
  recipientPrivateAddressStpl1: string;
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex?: string;
  assetId: string;
  amountDisplay: number;
  txId: string;
}

export async function buildCoinDeliveryPostBody(
  input: BuildCoinDeliveryPostBodyInput,
): Promise<PostCoinDeliveryBody> {
  await getPrivacyPoolService().getInitializedSdk();
  const depositScalarHex = input.depositScalarHex;
  const shared = await sharedSecretFromDepositorPreimage({
    depositScalarHex,
    recipientPrivateAddressStpl1: input.recipientPrivateAddressStpl1.trim(),
  });

  const payload: CoinDeliveryPayloadV1 = {
    version: COIN_DELIVERY_PAYLOAD_VERSION,
    commitmentHex: input.commitmentHex,
    coin: input.coin,
    depositScalarHex,
    precommitementHex: input.precommitementHex,
    asset: input.assetId,
    amountDisplay: input.amountDisplay,
    txId: input.txId,
  };

  const plain = stringifyCoinDeliveryPayloadV1(payload);
  const cipherBytes = await encryptCoinPayload(shared.sharedSecretX, plain);
  const tagBytes = await tagFromCiphertextBytes(cipherBytes);
  const ephemeralKey = await encodeEphemeralKeyFromDepositScalar(depositScalarHex);

  return {
    recipientStealthAddress: input.recipientPrivateAddressStpl1.trim(),
    assetId: input.assetId,
    ciphertextBase64: uint8ToBase64(cipherBytes),
    ephemeralKey,
    tagBase64: uint8ToBase64(tagBytes),
  };
}
