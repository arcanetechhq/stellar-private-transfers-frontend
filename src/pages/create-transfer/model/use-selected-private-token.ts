import { useEffect, useState } from "react";
import type { AssetWithTrustline } from "@/entities/asset";

export function useSelectedPrivateToken(
  privateTransferAssets: AssetWithTrustline[],
  assetIdFromUrl: string | null,
) {
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedToken, setSelectedToken] = useState<
    AssetWithTrustline | undefined
  >();
  useEffect(() => {
    if (privateTransferAssets.length === 0) {
      setSelectedToken(undefined);
      return;
    }
    setSelectedToken((previous) => {
      const matchPrevious = previous
        ? privateTransferAssets.find(
            (asset) => asset.assetId === previous.assetId,
          )
        : undefined;
      if (matchPrevious) {
        return matchPrevious;
      }
      const fromUrl = assetIdFromUrl
        ? privateTransferAssets.find(
            (asset) => asset.assetId === assetIdFromUrl,
          )
        : undefined;
      return fromUrl ?? privateTransferAssets[0];
    });
  }, [privateTransferAssets, assetIdFromUrl]);

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setSelectedToken(asset);
    setShowTokenPicker(false);
  };

  return {
    showTokenPicker,
    setShowTokenPicker,
    showContactPicker,
    setShowContactPicker,
    selectedToken,
    handleTokenSelect,
  };
}
