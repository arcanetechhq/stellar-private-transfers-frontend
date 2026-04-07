const DEFAULT_USD_PRICE = 1;
const VITE_PRICE_PREFIX = "VITE_PRICE_";

const assetUsdPriceById = new Map<string, number>();

function normalizeUsdPrice(rawPrice: string | undefined): number {
  if (rawPrice === undefined) {
    return DEFAULT_USD_PRICE;
  }

  const parsedPrice = Number(rawPrice);
  if (!Number.isFinite(parsedPrice)) {
    return DEFAULT_USD_PRICE;
  }

  return parsedPrice;
}

function resolveEnvironmentUsdPrice(assetId: string): number {
  const exactKey = `${VITE_PRICE_PREFIX}${assetId}`;
  const upperKey = `${VITE_PRICE_PREFIX}${assetId.toUpperCase()}`;
  const environmentRecord = import.meta.env as Record<string, string | undefined>;

  return normalizeUsdPrice(
    environmentRecord[exactKey] ?? environmentRecord[upperKey],
  );
}

export function initializeAssetUsdPrices(assetIds: readonly string[]): void {
  for (const assetId of assetIds) {
    if (assetUsdPriceById.has(assetId)) {
      continue;
    }
    assetUsdPriceById.set(assetId, resolveEnvironmentUsdPrice(assetId));
  }
}

export function getAssetUsdPrice(assetId: string): number {
  if (!assetUsdPriceById.has(assetId)) {
    assetUsdPriceById.set(assetId, resolveEnvironmentUsdPrice(assetId));
  }
  return assetUsdPriceById.get(assetId) ?? DEFAULT_USD_PRICE;
}
