import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import {
  resolveClaimAssetId,
  type EscrowClaimAssetCatalogEntry,
} from "./pending-escrow-asset-claims.js";

export function stampSweepPersistAsset(input: {
  tokenAddress: string;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
  outputRecords: readonly StellarPrivateRecord[];
}): {
  persistAssetId: string;
  outputRecords: StellarPrivateRecord[];
} {
  const persistAssetId = resolveClaimAssetId({
    tokenAddress: input.tokenAddress,
    catalog: input.catalog,
    fallback: input.tokenAddress.trim(),
  });
  return {
    persistAssetId,
    outputRecords: input.outputRecords.map((record) => ({
      ...record,
      asset: persistAssetId,
    })),
  };
}
