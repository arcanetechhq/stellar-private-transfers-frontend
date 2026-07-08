import type { StellarAsset } from "@arcanetech/privacy-sdk-stellar";
import type { AssetDto } from "@/entities/asset";

export function mapAssetDtoToStellarAsset(asset: AssetDto): StellarAsset {
  return {
    id: asset.id,
    assetId: asset.assetId,
    name: asset.name,
    logoUrl: asset.logoUrl,
    issuerAddress: asset.issuerAddress,
    clientContract: asset.clientContract,
    poolContracts: asset.poolContracts,
    poolContract: asset.poolContract,
    mintable: asset.mintable,
    mintAmount: asset.mintAmount,
    decimals: asset.decimals,
  };
}
