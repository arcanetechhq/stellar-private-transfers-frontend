import type { AssetWithTrustline } from "@/entities/asset";

export interface ResolveSelectedDepositAssetInput {
  selectedToken: AssetWithTrustline | undefined;
  assets: AssetWithTrustline[];
  assetIdFromUrl: string | null;
}

export function resolveSelectedDepositAsset(
  input: ResolveSelectedDepositAssetInput,
): AssetWithTrustline | undefined {
  return (
    input.selectedToken ??
    input.assets.find((asset) => asset.assetId === input.assetIdFromUrl) ??
    input.assets[0]
  );
}
