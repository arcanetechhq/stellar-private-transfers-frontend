import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import { assetApi, type AssetDto } from "@/entities/asset";
import { syncCoinItemsToSdkState } from "@/entities/coin/lib/sync-private-records-to-sdk.js";
import type { RootState } from "@/store";
import { syncAssetsToSdkState } from "./sync-assets-to-sdk-state.js";

const LEGACY_MERKLE_CACHE_PREFIX = "stellar:merkle:";
const POOL_MERKLE_SYNC_INTERVAL_MS = 90_000;

function readCachedAssets(state: RootState): AssetDto[] | undefined {
  const cached = assetApi.endpoints.getAssets.select()(state).data;
  return cached && cached.length > 0 ? cached : undefined;
}

export function collectPoolContractIdsFromCoinItems(state: RootState): string[] {
  const unique = new Set<string>();
  for (const item of state.coin.items) {
    const poolContract = item.poolContract?.trim();
    if (poolContract) {
      unique.add(poolContract);
    }
  }
  return [...unique];
}

function listLegacyMerkleCacheKeys(): string[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  const legacyKeys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(LEGACY_MERKLE_CACHE_PREFIX)) {
      legacyKeys.push(key);
    }
  }
  return legacyKeys;
}

async function migrateLegacyMerkleCacheKey(
  client: StellarPrivacyClient,
  key: string,
): Promise<void> {
  const poolContract = key.slice(LEGACY_MERKLE_CACHE_PREFIX.length).trim();
  if (!poolContract) {
    localStorage.removeItem(key);
    return;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        commitments?: string[];
        merkleRootHex?: string;
        updatedAt?: number;
      };
      if (parsed.commitments && parsed.commitments.length > 0) {
        await client.setPoolMerkleState({
          poolContract,
          commitments: parsed.commitments,
          commitmentCount: parsed.commitments.length,
          merkleRootHex: parsed.merkleRootHex ?? "",
          updatedAt: parsed.updatedAt ?? Date.now(),
        });
      }
    }
  } catch {
    // NOTE: best-effort migration from removed localStorage cache.
  }
  localStorage.removeItem(key);
}

async function migrateLegacyMerkleLocalStorage(
  client: StellarPrivacyClient,
): Promise<void> {
  const legacyKeys = listLegacyMerkleCacheKeys();
  for (const key of legacyKeys) {
    await migrateLegacyMerkleCacheKey(client, key);
  }
}

export async function syncPoolMerkleStatesFromCoinItems(input: {
  client: StellarPrivacyClient;
  walletPublicKey: string | undefined;
}): Promise<void> {
  const trimmedPublicKey = input.walletPublicKey?.trim();
  if (!trimmedPublicKey) {
    return;
  }
  await migrateLegacyMerkleLocalStorage(input.client);
  const poolContractIds = collectPoolContractIdsFromCoinItems();
  if (poolContractIds.length === 0) {
    return;
  }
  await input.client.syncPoolMerkleStates({
    poolContractIds,
    walletPublicKey: trimmedPublicKey,
  });
}

export async function syncPrivacySdkCaches(input: {
  client: StellarPrivacyClient | undefined;
  walletPublicKey: string | undefined;
  getState: () => RootState;
}): Promise<void> {
  const state = input.getState();
  const assets = readCachedAssets(state);
  if (assets) {
    await syncAssetsToSdkState(assets);
  }
  const trimmedPublicKey = input.walletPublicKey?.trim();
  if (!trimmedPublicKey || !input.client) {
    return;
  }
  const coinItems = state.coin.items;
  if (coinItems.length > 0) {
    await syncCoinItemsToSdkState(coinItems, trimmedPublicKey);
  }
  await syncPoolMerkleStatesFromCoinItems({
    client: input.client,
    walletPublicKey: trimmedPublicKey,
  });
}

export function startPoolMerkleBackgroundSync(input: {
  client: StellarPrivacyClient;
  walletPublicKey: string | undefined;
  getPoolContractIds: () => string[];
}): () => void {
  const trimmedPublicKey = input.walletPublicKey?.trim();
  if (!trimmedPublicKey) {
    return () => {
      return;
    };
  }
  let cancelled = false;
  const syncAll = async () => {
    const poolContractIds = input.getPoolContractIds();
    if (cancelled || poolContractIds.length === 0) {
      return;
    }
    try {
      await input.client.syncPoolMerkleStates({
        poolContractIds,
        walletPublicKey: trimmedPublicKey,
      });
    } catch {
      // NOTE: background best-effort sync; errors are non-fatal.
    }
  };
  void syncAll();
  const intervalId = globalThis.setInterval(syncAll, POOL_MERKLE_SYNC_INTERVAL_MS);
  return () => {
    cancelled = true;
    globalThis.clearInterval(intervalId);
  };
}
