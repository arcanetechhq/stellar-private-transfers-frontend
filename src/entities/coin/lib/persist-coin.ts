import type { CoinStatus, CoinWithMetadata } from "../model/coin";

const STORAGE_KEY_PREFIX = "coin-state-v2";

function storageKeyForWallet(publicKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${publicKey}`;
}

export function normalizeCommitmentHex(hex: string | undefined): string | undefined {
  if (!hex?.trim()) return undefined;
  return hex.trim().replace(/^0x/iu, "").toLowerCase();
}

function isCoinStatus(value: unknown): value is CoinStatus {
  return value === "pending" || value === "finalized" || value === "spent";
}

function isCoinData(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["value"] === "string" &&
    typeof record["nullifier"] === "string" &&
    typeof record["secret"] === "string" &&
    typeof record["commitment"] === "string"
  );
}

function hasFiniteAmountDisplay(record: Record<string, unknown>): boolean {
  return (
    typeof record["amountDisplay"] === "number" && Number.isFinite(record["amountDisplay"])
  );
}

function hasOptionalDepositScalarHex(record: Record<string, unknown>): boolean {
  return (
    record["depositScalarHex"] === undefined ||
    typeof record["depositScalarHex"] === "string"
  );
}

function hasOptionalTxId(record: Record<string, unknown>): boolean {
  return record["txId"] === undefined || typeof record["txId"] === "string";
}

function hasCoreCoinMetadata(record: Record<string, unknown>): boolean {
  return (
    typeof record["commitmentHex"] === "string" &&
    isCoinData(record["coin"]) &&
    typeof record["stealthAddress"] === "string" &&
    typeof record["assetId"] === "string" &&
    typeof record["poolContract"] === "string" &&
    hasFiniteAmountDisplay(record) &&
    isCoinStatus(record["status"])
  );
}

function isCoinWithMetadata(value: unknown): value is CoinWithMetadata {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (!hasCoreCoinMetadata(record)) return false;
  if (!hasOptionalDepositScalarHex(record)) return false;
  return hasOptionalTxId(record);
}

export function loadCoinState(publicKey: string): CoinWithMetadata[] {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CoinWithMetadata => isCoinWithMetadata(item));
  } catch {
    return [];
  }
}

function safeSetItem(itemKey: string, value: string): boolean {
  try {
    localStorage.setItem(itemKey, value);
    return true;
  } catch {
    return false;
  }
}

export function saveCoinState(publicKey: string, items: CoinWithMetadata[]): void {
  void safeSetItem(storageKeyForWallet(publicKey), JSON.stringify(items));
}
