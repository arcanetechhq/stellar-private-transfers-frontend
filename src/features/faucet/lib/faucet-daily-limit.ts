const STORAGE_PREFIX = "arcane-faucet-daily-v1:";

export class FaucetDailyLimitError extends Error {
  constructor() {
    super("Faucet already claimed today for this account");
    this.name = "FaucetDailyLimitError";
  }
}

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function storageKey(publicKey: string): string {
  return `${STORAGE_PREFIX}${publicKey}`;
}

function normalizeAssetId(assetId: string): string {
  return assetId.trim().toLowerCase();
}

function readClaimDays(publicKey: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(storageKey(publicKey));
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        result[normalizeAssetId(key)] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeClaimDays(
  publicKey: string,
  claimDays: Record<string, string>,
): void {
  try {
    localStorage.setItem(storageKey(publicKey), JSON.stringify(claimDays));
  } catch {
    return;
  }
}

export function hasClaimedFaucetToday(
  publicKey: string,
  assetId: string,
): boolean {
  const claimDays = readClaimDays(publicKey);
  return claimDays[normalizeAssetId(assetId)] === utcDayKey();
}

export function markFaucetClaimedToday(
  publicKey: string,
  assetId: string,
): void {
  const claimDays = readClaimDays(publicKey);
  claimDays[normalizeAssetId(assetId)] = utcDayKey();
  writeClaimDays(publicKey, claimDays);
}

export function assertFaucetClaimAllowed(
  publicKey: string,
  assetId: string,
): void {
  if (hasClaimedFaucetToday(publicKey, assetId)) {
    throw new FaucetDailyLimitError();
  }
}
