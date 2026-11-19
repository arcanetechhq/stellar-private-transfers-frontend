import type { StellarAssetWallet } from "../api/fireblocks-asset-wallets";
import { isRecord } from "./record-value";

const SELECTED_ASSET_STORAGE_KEY = "arcane.fireblocks-custodian.asset";
const STELLAR_ADDRESS_PREFIX = "G";

function readText(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function parseSelectedAsset(value: unknown): StellarAssetWallet | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const address = readText(value, "address");
  const vaultId = readText(value, "vaultId");
  const assetId = readText(value, "assetId");
  if (
    vaultId.length === 0 ||
    assetId.length === 0 ||
    !address.startsWith(STELLAR_ADDRESS_PREFIX)
  ) {
    return undefined;
  }
  return {
    vaultId,
    assetId,
    address,
    available: readText(value, "available"),
  };
}

export function readSelectedFireblocksAsset(): StellarAssetWallet | undefined {
  const raw = localStorage.getItem(SELECTED_ASSET_STORAGE_KEY) ?? "";
  if (raw.length === 0) {
    return undefined;
  }
  try {
    return parseSelectedAsset(JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

export function saveSelectedFireblocksAsset(wallet: StellarAssetWallet): void {
  const stored: StellarAssetWallet = {
    vaultId: wallet.vaultId.trim(),
    assetId: wallet.assetId.trim(),
    address: wallet.address.trim(),
    available: wallet.available,
  };
  localStorage.setItem(SELECTED_ASSET_STORAGE_KEY, JSON.stringify(stored));
}

export function clearSelectedFireblocksAsset(): void {
  localStorage.removeItem(SELECTED_ASSET_STORAGE_KEY);
}
