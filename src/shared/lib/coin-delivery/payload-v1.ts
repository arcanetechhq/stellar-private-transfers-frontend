import type { CoinData } from "@/shared/lib/privacy-sdk/types.js";

export const COIN_DELIVERY_PAYLOAD_VERSION = 1 as const;

export interface CoinDeliveryPayloadV1 {
  version: typeof COIN_DELIVERY_PAYLOAD_VERSION;
  commitmentHex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex?: string;
  asset: string;
  amountDisplay: number;
  txId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasValidCoinFields(coinRecord: Record<string, unknown>): boolean {
  return (
    typeof coinRecord["value"] === "string" &&
    typeof coinRecord["nullifier"] === "string" &&
    typeof coinRecord["secret"] === "string" &&
    typeof coinRecord["commitment"] === "string" &&
    typeof coinRecord["asset_hi"] === "string" &&
    typeof coinRecord["asset_lo"] === "string"
  );
}

function hasValidStringField(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === "string" && Boolean((record[key] as string).trim());
}

interface OptionalPayloadFields {
  asset: string;
  amountDisplay: number;
  txId: string;
}

function buildOptionalFields(payload: Record<string, unknown>): OptionalPayloadFields {
  return {
    asset: typeof payload["asset"] === "string" ? payload["asset"] : "XLM",
    amountDisplay:
      typeof payload["amountDisplay"] === "number" &&
      Number.isFinite(payload["amountDisplay"])
        ? payload["amountDisplay"]
        : 0,
    txId: typeof payload["txId"] === "string" ? payload["txId"] : "incoming",
  };
}

function optionalPrecommitementHex(
  payload: Record<string, unknown>,
): string | undefined {
  const value = payload["precommitementHex"];
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

export function parseCoinDeliveryPayloadV1(
  payload: unknown,
): CoinDeliveryPayloadV1 | undefined {
  if (!isRecord(payload)) return undefined;
  if (payload["version"] !== COIN_DELIVERY_PAYLOAD_VERSION) return undefined;
  if (!hasValidStringField(payload, "commitmentHex")) return undefined;
  if (!isRecord(payload["coin"])) return undefined;
  const coinData = payload["coin"];
  if (!hasValidCoinFields(coinData)) return undefined;
  if (!hasValidStringField(payload, "depositScalarHex")) return undefined;
  return {
    version: COIN_DELIVERY_PAYLOAD_VERSION,
    commitmentHex: (payload["commitmentHex"] as string).trim(),
    coin: {
      value: coinData["value"] as string,
      nullifier: coinData["nullifier"] as string,
      secret: coinData["secret"] as string,
      commitment: coinData["commitment"] as string,
      asset_hi: coinData["asset_hi"] as string,
      asset_lo: coinData["asset_lo"] as string,
    },
    depositScalarHex: (payload["depositScalarHex"] as string).trim(),
    precommitementHex: optionalPrecommitementHex(payload),
    ...buildOptionalFields(payload),
  };
}

export function stringifyCoinDeliveryPayloadV1(
  payloadData: CoinDeliveryPayloadV1,
): string {
  return JSON.stringify(payloadData);
}
