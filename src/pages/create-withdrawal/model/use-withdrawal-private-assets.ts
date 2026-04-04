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
  const privateAssets = useMemo(
    () => buildPrivateTransferAssets(aggregates, assetCatalog),
    [aggregates, assetCatalog],
  );
  const tokenUi = useSelectedPrivateToken(privateAssets, assetIdFromUrl);
  return { withdrawalSender, privateAssets, tokenUi };
}
