import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { useGetAssetsQuery } from "@/entities/asset";
import {
  selectFinalizedAggregatesForPrivateAddress,
  withZeroAmountPrivateAssetRows,
} from "@/entities/coin";
import { buildPrivateTransferAssets } from "../lib/private-transfer-asset-list";
import { useSelectedPrivateToken } from "./use-selected-private-token";
import { useTransferAmountInputs } from "./use-transfer-amount-inputs";

export function useTransferAssetModel(
  senderPrivateAddress: string,
  assetIdFromUrl: string | null,
) {
  const aggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(
      state,
      senderPrivateAddress || undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();
  const aggregatesWithZeroAssets = useMemo(() => {
    return withZeroAmountPrivateAssetRows(aggregates, assetCatalog);
  }, [aggregates, assetCatalog]);
  const privateTransferAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, assetCatalog),
    [aggregatesWithZeroAssets, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(
    privateTransferAssets,
    assetIdFromUrl,
  );
  const amountInputs = useTransferAmountInputs(tokenUi.selectedToken);
  return {
    assets: privateTransferAssets,
    tokenUi,
    amountInputs,
    selectedAsset: tokenUi.selectedToken,
  };
}
