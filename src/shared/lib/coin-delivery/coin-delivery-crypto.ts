import { hexToBytes } from "@/shared/lib/hex-bytes";

const HEX_32_LENGTH = 64;
const GCM_IV_LENGTH = 12;
const GCM_AUTH_TAG_LENGTH = 16;
const GCM_MIN_LENGTH = GCM_IV_LENGTH + GCM_AUTH_TAG_LENGTH;

function normalizeHex32(xHex: string): string {
  const stripped = xHex.trim().replace(/^0x/iu, "");
  if (!/^[\da-f]+$/iu.test(stripped) || stripped.length !== HEX_32_LENGTH) {
    throw new Error("sharedSecret.x must be 32-byte hex (64 chars)");
  }
  return stripped.toLowerCase();
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(
    await globalThis.crypto.subtle.digest("SHA-256", data as BufferSource),
  );
}

async function aesKeyFromSharedSecretXHex(sharedXHex: string): Promise<CryptoKey> {
  const hex = normalizeHex32(sharedXHex);
  const raw = await sha256(hexToBytes(hex));
  return globalThis.crypto.subtle.importKey(
    "raw",
    raw as BufferSource,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptCoinPayload(
  sharedXHex: string,
  plaintextUtf8: string,
): Promise<Uint8Array> {
  const key = await aesKeyFromSharedSecretXHex(sharedXHex);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const data = new TextEncoder().encode(plaintextUtf8);
  const ct = new Uint8Array(
    await globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, data),
  );
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return out;
}

export async function decryptCoinPayload(
  sharedXHex: string,
  ciphertextBundle: Uint8Array,
): Promise<string> {
  if (ciphertextBundle.length < GCM_MIN_LENGTH) {
    throw new Error("ciphertext too short");
  }
  const key = await aesKeyFromSharedSecretXHex(sharedXHex);
  const iv = ciphertextBundle.slice(0, GCM_IV_LENGTH);
  const ct = ciphertextBundle.slice(GCM_IV_LENGTH);
  const plain = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    ct,
  );
  return new TextDecoder().decode(plain);
}

export async function tagFromCiphertextBytes(
  ciphertextBundle: Uint8Array,
): Promise<Uint8Array> {
  return sha256(ciphertextBundle);
}
