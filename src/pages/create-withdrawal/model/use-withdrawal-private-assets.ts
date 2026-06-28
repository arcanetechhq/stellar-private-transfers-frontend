import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  buildPrivateTransferAssets,
  useGetAssetsQuery,
} from "@/entities/asset";
import {
  selectFinalizedAggregatesForPrivateAddress,
  withZeroAmountPrivateAssetRows,
} from "@/entities/coin";
import { useWithdrawalSender } from "./use-withdrawal-sender";
import { useSelectedPrivateToken } from "./use-selected-private-token";

export function useWithdrawalPrivateAssets(assetIdFromUrl: string | null) {
  const withdrawalSender = useWithdrawalSender();
  const aggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(
      state,
      withdrawalSender.senderPrivateAddress || undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();
  const aggregatesWithZeroAssets = useMemo(() => {
    return withZeroAmountPrivateAssetRows(aggregates, assetCatalog);
  }, [aggregates, assetCatalog]);
  const privateAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, assetCatalog),
    [aggregatesWithZeroAssets, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(privateAssets, assetIdFromUrl);
  return { withdrawalSender, privateAssets, tokenUi };
}
