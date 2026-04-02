import {
  decodeStealthAddress,
  encodeDecodedEphemeralKey,
  type CoinData,
} from "@auditable/privacy-pool-zk-sdk";
import type { PostCoinDeliveryBody } from "@/entities/coin-deliveries";
import {
  encryptCoinPayload,
  tagFromCiphertextBytes,
} from "@/shared/lib/coin-delivery";
import {
  COIN_DELIVERY_PAYLOAD_VERSION,
  stringifyCoinDeliveryPayloadV1,
  type CoinDeliveryPayloadV1,
} from "@/shared/lib/coin-delivery/payload-v1";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";

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
  recipientStealthStpl1: string;
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex: string;
  assetId: string;
  amountDisplay: number;
  txId: string;
}

export async function buildCoinDeliveryPostBody(
  input: BuildCoinDeliveryPostBodyInput,
): Promise<PostCoinDeliveryBody> {
  const sdk = await privacyPoolService.getInitializedSdk();
  const depositScalarHex = input.depositScalarHex;
  const recipientStealthAddress = decodeStealthAddress(
    input.recipientStealthStpl1.trim(),
  );
  const shared = sdk.sharedSecretFromDepositorPreimage({
    randomNonceScalar: depositScalarHex,
    recipientStealthAddress,
  });

  const payload: CoinDeliveryPayloadV1 = {
    version: COIN_DELIVERY_PAYLOAD_VERSION,
    commitmentHex: input.commitmentHex,
    coin: input.coin,
    depositScalarHex,
    asset: input.assetId,
    amountDisplay: input.amountDisplay,
    txId: input.txId,
  };

  const plain = stringifyCoinDeliveryPayloadV1(payload);
  const cipherBytes = await encryptCoinPayload(shared.x, plain);
  const tagBytes = await tagFromCiphertextBytes(cipherBytes);

  const point = sdk.ecdhEphemeralPublicKeyFromScalarHex(depositScalarHex);
  const ephemeralKey = encodeDecodedEphemeralKey(point);

  return {
    recipientStealthAddress: input.recipientStealthStpl1.trim(),
    assetId: input.assetId,
    ciphertextBase64: uint8ToBase64(cipherBytes),
    ephemeralKey,
    tagBase64: uint8ToBase64(tagBytes),
  };
}
