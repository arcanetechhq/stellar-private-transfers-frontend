import { Buffer } from "buffer";

const ENV_AUDIT_PUBLIC_KEY = "VITE_STELLAR_AUDIT_PUBLIC_KEY";
const HEX_RADIX = 16;
const FIELD_ELEMENT_HEX_CHARS = 64;

export function getAuditPublicKey(): Uint8Array {
  const hex = import.meta.env[ENV_AUDIT_PUBLIC_KEY] as string | undefined;
  if (!hex || typeof hex !== "string") {
    throw new Error(
      "VITE_STELLAR_AUDIT_PUBLIC_KEY is not set. Add hex-encoded EC public key to .env",
    );
  }
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return new Uint8Array(Buffer.from(clean, "hex"));
}

export function decimalFieldToBytes(decimal: string): Uint8Array {
  const bigValue = BigInt(decimal);
  const hex = bigValue
    .toString(HEX_RADIX)
    .padStart(FIELD_ELEMENT_HEX_CHARS, "0");
  return new Uint8Array(Buffer.from(hex, "hex"));
}
