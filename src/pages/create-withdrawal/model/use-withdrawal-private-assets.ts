import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  buildPrivateTransferAssets,
  useGetAssetsQuery,
} from "@/entities/asset";
import { selectFinalizedAggregatesForStealth } from "@/entities/coin";
import { useWithdrawalSender } from "./use-withdrawal-sender";
import { useSelectedPrivateToken } from "./use-selected-private-token";

export function useWithdrawalPrivateAssets(assetIdFromUrl: string | null) {
  const withdrawalSender = useWithdrawalSender();
  const aggregates = useAppSelector(
    selectFinalizedAggregatesForStealth(
      withdrawalSender.senderStealthAddress || undefined,
    ),
  );
  const { data: assetCatalog } = useGetAssetsQuery();
  const aggregatesWithZeroAssets = useMemo(() => {
    const byAssetId = new Map(
      aggregates.map((aggregate) => [aggregate.assetId, aggregate]),
    );
    if (assetCatalog) {
      for (const asset of assetCatalog) {
        if (byAssetId.has(asset.assetId)) {
          continue;
        }
        byAssetId.set(asset.assetId, {
          assetId: asset.assetId,
          poolContract: asset.poolContract ?? "",
          totalAmountDisplay: 0,
        });
      }
    }
    return [...byAssetId.values()].toSorted((left, right) =>
      left.assetId.localeCompare(right.assetId),
    );
  }, [aggregates, assetCatalog]);
  const privateAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, assetCatalog),
    [aggregatesWithZeroAssets, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(privateAssets, assetIdFromUrl);
  return { withdrawalSender, privateAssets, tokenUi };
}
