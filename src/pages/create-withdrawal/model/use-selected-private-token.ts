import { useMemo, useState } from "react";
import type { AssetWithTrustline } from "@/entities/asset";

export function useSelectedPrivateToken(
  privateAssets: AssetWithTrustline[],
  assetIdFromUrl: string | null,
) {
  const [userSelectedAssetId, setUserSelectedAssetId] = useState<
    string | undefined
  >();

  const selectedAssetId = useMemo(() => {
    if (privateAssets.length === 0) {
      return;
    }
    if (
      userSelectedAssetId &&
      privateAssets.some((asset) => asset.assetId === userSelectedAssetId)
    ) {
      return userSelectedAssetId;
    }
    const fromUrl = assetIdFromUrl
      ? privateAssets.find((asset) => asset.assetId === assetIdFromUrl)
      : undefined;
    return fromUrl?.assetId ?? privateAssets[0]?.assetId;
  }, [privateAssets, assetIdFromUrl, userSelectedAssetId]);

  const selectedToken = useMemo(
    () =>
      selectedAssetId
        ? privateAssets.find((asset) => asset.assetId === selectedAssetId)
        : undefined,
    [privateAssets, selectedAssetId],
  );

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setUserSelectedAssetId(asset.assetId);
  };

  return {
    selectedToken,
    handleTokenSelect,
  };
}
