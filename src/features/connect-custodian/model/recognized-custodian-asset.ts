import type { AssetDto } from "@/entities/asset";
import { isNativeCatalogXlm } from "@/entities/asset";
import type { StellarAssetWallet } from "./stellar-asset-wallet";

const TEST_ASSET_SUFFIX = "_TEST";
const NATIVE_FIREBLOCKS_ASSET_IDS = new Set(["XLM", "XLM_TEST"]);

export type RecognizedCustodianWallet = {
  wallet: StellarAssetWallet;
  asset: AssetDto;
};

function sameAssetCode(left: string, right: string): boolean {
  return left.trim().toUpperCase() === right.trim().toUpperCase();
}

function singleCatalogMatch(
  catalog: readonly AssetDto[],
  predicate: (asset: AssetDto) => boolean,
): AssetDto | undefined {
  const matches = catalog.filter((asset) => predicate(asset));
  return matches.length === 1 ? matches[0] : undefined;
}

export function catalogAssetForFireblocksId(
  fireblocksAssetId: string,
  catalog: readonly AssetDto[],
): AssetDto | undefined {
  const assetId = fireblocksAssetId.trim();
  if (NATIVE_FIREBLOCKS_ASSET_IDS.has(assetId)) {
    return catalog.find((asset) => isNativeCatalogXlm(asset));
  }
  const exact = singleCatalogMatch(catalog, (asset) =>
    sameAssetCode(asset.assetId, assetId),
  );
  if (exact) {
    return exact;
  }
  if (!assetId.endsWith(TEST_ASSET_SUFFIX)) {
    return undefined;
  }
  const code = assetId.slice(0, -TEST_ASSET_SUFFIX.length);
  return singleCatalogMatch(catalog, (asset) =>
    sameAssetCode(asset.assetId, code),
  );
}

export function recognizedCustodianWallets(
  wallets: readonly StellarAssetWallet[],
  catalog: readonly AssetDto[],
): RecognizedCustodianWallet[] {
  const recognized: RecognizedCustodianWallet[] = [];
  for (const wallet of wallets) {
    const asset = catalogAssetForFireblocksId(wallet.assetId, catalog);
    if (asset) {
      recognized.push({ wallet, asset });
    }
  }
  return recognized;
}
