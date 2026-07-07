import type { AssetDto } from "@/entities/asset";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";
import { mapAssetDtoToStellarAsset } from "./map-asset-dto-to-stellar-asset.js";

export async function syncAssetsToSdkState(assets: AssetDto[]): Promise<void> {
  const client = tryGetPrivacySdkClient();
  if (!client || assets.length === 0) {
    return;
  }
  await client.replaceAssets(assets.map((asset) => mapAssetDtoToStellarAsset(asset)));
}
