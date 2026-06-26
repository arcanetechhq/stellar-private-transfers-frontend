import {
  DEMO_AUDIT_PUBLIC_KEY,
  resolveTransactionAuditParams,
  type AuditPublicKey,
  type TransactionAuditParams,
} from "@auditable/privacy-pool-zk-sdk";
import { Buffer } from "buffer";

const UNCOMPRESSED_PREFIX = "04";
const UNCOMPRESSED_HEX_LENGTH = 130;
const XY_HEX_LENGTH = 128;
const X_OFFSET_END = 32;
const Y_OFFSET_START = 32;
const Y_OFFSET_END = 64;
const DECIMAL_RADIX = 10;
const BN254_FR_MODULUS =
  21_888_242_871_839_275_222_246_405_745_257_275_088_548_364_400_416_034_343_698_204_186_575_808_495_617n;
const BABYJUBJUB_A = 168_700n;
const BABYJUBJUB_D = 168_696n;
const BABYJUB_CURVE_ONE = 1n;

function passesBabyJubCurveCheck(
  coordinateX: bigint,
  coordinateY: bigint,
): boolean {
  const xSquared = (coordinateX * coordinateX) % BN254_FR_MODULUS;
  const ySquared = (coordinateY * coordinateY) % BN254_FR_MODULUS;
  const lhs = (BABYJUBJUB_A * xSquared + ySquared) % BN254_FR_MODULUS;
  const rhs =
    (BABYJUB_CURVE_ONE + BABYJUBJUB_D * xSquared * ySquared) % BN254_FR_MODULUS;
  return lhs === rhs;
}

function readClientEnvironment(name: string): string | undefined {
  const value = (
    import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  ).env?.[name];
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function resolvePoolApplicationId(): string {
  return readClientEnvironment("VITE_APPLICATION_ID") ?? "101";
}

function resolvePoolAuditPublicKey(): AuditPublicKey {
  const raw = readClientEnvironment("VITE_STELLAR_AUDIT_PUBLIC_KEY");
  if (!raw) {
    return DEMO_AUDIT_PUBLIC_KEY;
  }
  const normalized = raw.replace(/^0x/i, "");
  const payload =
    normalized.length === UNCOMPRESSED_HEX_LENGTH &&
    normalized.startsWith(UNCOMPRESSED_PREFIX)
      ? normalized.slice(UNCOMPRESSED_PREFIX.length)
      : normalized;
  if (payload.length !== XY_HEX_LENGTH || !/^[\da-fA-F]+$/.test(payload)) {
    throw new Error(
      "VITE_STELLAR_AUDIT_PUBLIC_KEY must be uncompressed 65-byte hex (04 + X + Y) or 64-byte X+Y hex",
    );
  }
  const bytes = Buffer.from(payload, "hex");
  const auditPublicKeyXDecimal = BigInt(
    `0x${bytes.subarray(0, X_OFFSET_END).toString("hex")}`,
  ).toString(DECIMAL_RADIX);
  const auditPublicKeyYDecimal = BigInt(
    `0x${bytes.subarray(Y_OFFSET_START, Y_OFFSET_END).toString("hex")}`,
  ).toString(DECIMAL_RADIX);
  if (
    !passesBabyJubCurveCheck(
      BigInt(auditPublicKeyXDecimal),
      BigInt(auditPublicKeyYDecimal),
    )
  ) {
    throw new Error(
      "VITE_STELLAR_AUDIT_PUBLIC_KEY is not a valid BabyJubJub point. Recreate the audit application and copy auditPublicKeyEnv again.",
    );
  }
  return [auditPublicKeyXDecimal, auditPublicKeyYDecimal];
}

export function buildPoolTransactionAuditParameters(
  applicationId?: string,
): TransactionAuditParams {
  return resolveTransactionAuditParams(
    applicationId ?? resolvePoolApplicationId(),
    resolvePoolAuditPublicKey(),
  );
}
