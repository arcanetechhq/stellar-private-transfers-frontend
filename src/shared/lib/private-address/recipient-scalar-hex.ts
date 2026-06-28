import { bytesToHexLower, hexToBytes } from "@/shared/lib/hex-bytes";

const ED25519_SIGNATURE_HEX_LENGTH = 128;
const ED25519_RAW_BYTE_LENGTH = 64;

function decodeBase64ToBytes(value: string): Uint8Array {
  const trimmed = value.replaceAll(/\s/g, "");
  const binary = atob(trimmed);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    const codePoint = binary.codePointAt(index);
    out[index] = codePoint === undefined ? 0 : codePoint;
  }
  return out;
}

export function parseStellarEd25519SignatureRaw(input: string): Uint8Array {
  const trimmed = input.trim();
  const without0x = trimmed.replace(/^0x/iu, "");
  if (
    /^[0-9a-f]+$/iu.test(without0x) &&
    without0x.length === ED25519_SIGNATURE_HEX_LENGTH
  ) {
    return hexToBytes(without0x.toLowerCase());
  }
  const fromBase64 = decodeBase64ToBytes(trimmed);
  if (fromBase64.length !== ED25519_RAW_BYTE_LENGTH) {
    throw new Error(
      `Decoded signature must be ${ED25519_RAW_BYTE_LENGTH} bytes (Ed25519); got ${fromBase64.length}`,
    );
  }
  return fromBase64;
}

export async function recipientScalarHexFromStellarSignature(
  signature: string,
): Promise<string> {
  const raw = parseStellarEd25519SignatureRaw(signature);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("crypto.subtle is required");
  }
  const hash = new Uint8Array(
    await subtle.digest("SHA-256", raw as BufferSource),
  );
  return bytesToHexLower(hash);
}
