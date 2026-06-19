const HEX_PAIR_WIDTH = 2;
const HEX_RADIX = 16;
const ED25519_SIGNATURE_HEX_LENGTH = 128;
const ED25519_RAW_BYTE_LENGTH = 64;

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / HEX_PAIR_WIDTH);
  for (let index = 0; index < out.length; index++) {
    out[index] = Number.parseInt(
      hex.slice(index * HEX_PAIR_WIDTH, index * HEX_PAIR_WIDTH + HEX_PAIR_WIDTH),
      HEX_RADIX,
    );
  }
  return out;
}

function bytesToHexLower(bytes: Uint8Array): string {
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(HEX_RADIX).padStart(HEX_PAIR_WIDTH, "0");
  }
  return result;
}

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
