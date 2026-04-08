import { useMemo, useState } from "react";
import type { AssetWithTrustline } from "@/entities/asset";

export function useSelectedPrivateToken(
  privateTransferAssets: AssetWithTrustline[],
  assetIdFromUrl: string | null,
) {
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [userSelectedAssetId, setUserSelectedAssetId] = useState<
    string | undefined
  >();

  const selectedAssetId = useMemo(() => {
    if (privateTransferAssets.length === 0) {
      return;
    }
    if (
      userSelectedAssetId &&
      privateTransferAssets.some((asset) => asset.assetId === userSelectedAssetId)
    ) {
      return userSelectedAssetId;
    }
    const fromUrl = assetIdFromUrl
      ? privateTransferAssets.find((asset) => asset.assetId === assetIdFromUrl)
      : undefined;
    return fromUrl?.assetId ?? privateTransferAssets[0]?.assetId;
  }, [privateTransferAssets, assetIdFromUrl, userSelectedAssetId]);

  const selectedToken = useMemo(
    () =>
      selectedAssetId
        ? privateTransferAssets.find((asset) => asset.assetId === selectedAssetId)
        : undefined,
    [privateTransferAssets, selectedAssetId],
  );

  const handleTokenSelect = (asset: AssetWithTrustline) => {
    setUserSelectedAssetId(asset.assetId);
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
