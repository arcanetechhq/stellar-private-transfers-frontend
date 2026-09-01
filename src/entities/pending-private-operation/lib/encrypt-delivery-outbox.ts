import { bytesToHexLower, hexToBytes } from "@/shared/lib/hex-bytes.js";

const KEY_PURPOSE = "stellar-payment-delivery-outbox-v1";
const ENVELOPE_VERSION = 1;
const AES_GCM_NAME = "AES-GCM";
const GCM_IV_LENGTH = 12;
const GCM_TAG_BITS = 128;
const HEX_PAIR = 2;

export type EncryptedDeliveryOutbox = {
  version: number;
  alg: typeof AES_GCM_NAME;
  iv: string;
  ciphertext: string;
};

export type DeliveryOutboxPersistPayload = {
  deliveryOutbox: unknown;
  outputRecords: unknown;
};

function isHexString(value: string): boolean {
  return value.length % HEX_PAIR === 0 && /^[\da-f]+$/iu.test(value);
}

export function isEncryptedDeliveryOutbox(
  value: unknown,
): value is EncryptedDeliveryOutbox {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.version === ENVELOPE_VERSION &&
    record.alg === AES_GCM_NAME &&
    typeof record.iv === "string" &&
    typeof record.ciphertext === "string" &&
    isHexString(record.iv) &&
    isHexString(record.ciphertext)
  );
}

async function aesKeyForWallet(walletPublicKey: string): Promise<CryptoKey> {
  const material = new TextEncoder().encode(`${KEY_PURPOSE}:${walletPublicKey}`);
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    material as BufferSource,
  );
  return globalThis.crypto.subtle.importKey(
    "raw",
    digest,
    AES_GCM_NAME,
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptDeliveryOutboxPayload(input: {
  walletPublicKey: string;
  payload: DeliveryOutboxPersistPayload;
}): Promise<EncryptedDeliveryOutbox> {
  const key = await aesKeyForWallet(input.walletPublicKey);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const data = new TextEncoder().encode(JSON.stringify(input.payload));
  const ciphertext = new Uint8Array(
    await globalThis.crypto.subtle.encrypt(
      { name: AES_GCM_NAME, iv: iv as BufferSource, tagLength: GCM_TAG_BITS },
      key,
      data as BufferSource,
    ),
  );
  return {
    version: ENVELOPE_VERSION,
    alg: AES_GCM_NAME,
    iv: bytesToHexLower(iv),
    ciphertext: bytesToHexLower(ciphertext),
  };
}

export async function decryptDeliveryOutboxPayload(input: {
  walletPublicKey: string;
  envelope: EncryptedDeliveryOutbox;
}): Promise<DeliveryOutboxPersistPayload> {
  const key = await aesKeyForWallet(input.walletPublicKey);
  const iv = hexToBytes(input.envelope.iv);
  const ciphertext = hexToBytes(input.envelope.ciphertext);
  const plain = await globalThis.crypto.subtle.decrypt(
    { name: AES_GCM_NAME, iv: iv as BufferSource, tagLength: GCM_TAG_BITS },
    key,
    ciphertext as BufferSource,
  );
  const parsed: unknown = JSON.parse(new TextDecoder().decode(plain));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("encrypted delivery outbox payload is invalid");
  }
  const record = parsed as Record<string, unknown>;
  return {
    deliveryOutbox: record.deliveryOutbox,
    outputRecords: record.outputRecords,
  };
}
