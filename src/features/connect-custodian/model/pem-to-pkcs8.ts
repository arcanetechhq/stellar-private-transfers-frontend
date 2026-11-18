import { FireblocksWizardError } from "./fireblocks-wizard-error";

const PKCS8_MARKER = "BEGIN PRIVATE KEY";
const PKCS1_MARKER = "BEGIN RSA PRIVATE KEY";
const RSA_ALGORITHM_IDENTIFIER_BASE64 = "MA0GCSqGSIb3DQEBAQUA";
const DER_SEQUENCE_TAG = 48;
const DER_OCTET_STRING_TAG = 4;
const SHORT_DER_LENGTH_LIMIT = 128;
const LONG_DER_LENGTH_FLAG = 128;
const DER_BYTE_BASE = 256;

function decodeBase64(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
}

function pemBody(pemText: string): string {
  return pemText.replaceAll(/-----[^-]+-----/gu, "").replaceAll(/\s+/gu, "");
}

function encodeDerLength(length: number): Uint8Array {
  if (length < SHORT_DER_LENGTH_LIMIT) {
    return Uint8Array.of(length);
  }
  const parts: number[] = [];
  let remaining = length;
  while (remaining > 0) {
    parts.unshift(remaining % DER_BYTE_BASE);
    remaining = Math.floor(remaining / DER_BYTE_BASE);
  }
  const encoded = new Uint8Array(1 + parts.length);
  encoded[0] = LONG_DER_LENGTH_FLAG + parts.length;
  encoded.set(parts, 1);
  return encoded;
}

function wrapDer(tag: number, content: Uint8Array): Uint8Array {
  const lengthBytes = encodeDerLength(content.length);
  const wrapped = new Uint8Array(1 + lengthBytes.length + content.length);
  wrapped[0] = tag;
  wrapped.set(lengthBytes, 1);
  wrapped.set(content, 1 + lengthBytes.length);
  return wrapped;
}

function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) {
    total += part.length;
  }
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return combined;
}

function wrapPkcs1(pkcs1: Uint8Array): Uint8Array {
  const version = Uint8Array.of(2, 1, 0);
  const algorithm = decodeBase64(RSA_ALGORITHM_IDENTIFIER_BASE64);
  const privateKey = wrapDer(DER_OCTET_STRING_TAG, pkcs1);
  return wrapDer(DER_SEQUENCE_TAG, concatBytes([version, algorithm, privateKey]));
}

export function pkcs8BytesFromPem(pemText: string): Uint8Array {
  try {
    const body = decodeBase64(pemBody(pemText));
    if (pemText.includes(PKCS1_MARKER)) {
      return wrapPkcs1(body);
    }
    if (pemText.includes(PKCS8_MARKER)) {
      return body;
    }
  } catch {
    throw new FireblocksWizardError("invalid-pem");
  }
  throw new FireblocksWizardError("invalid-pem");
}
