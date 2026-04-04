import { useEffect, useState } from "react";
import type { AssetWithTrustline } from "@/entities/asset";

export function useSelectedPrivateToken(
  privateAssets: AssetWithTrustline[],
  assetIdFromUrl: string | null,
) {
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    AssetWithTrustline | undefined
  >();
  useEffect(() => {
    if (privateAssets.length === 0) {
      setSelectedToken(undefined);
      return;
    }
    setSelectedToken((previous) => {
      const matchPrevious = previous
        ? privateAssets.find((asset) => asset.assetId === previous.assetId)
        : undefined;
      if (matchPrevious) {
        return matchPrevious;
      }
      const fromUrl = assetIdFromUrl
        ? privateAssets.find((asset) => asset.assetId === assetIdFromUrl)
        : undefined;
      return fromUrl ?? privateAssets[0];
    });
  }, [privateAssets, assetIdFromUrl]);

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setSelectedToken(asset);
    setShowTokenPicker(false);
  };

  return {
    showTokenPicker,
    setShowTokenPicker,
    selectedToken,
    handleTokenSelect,
  };
}
