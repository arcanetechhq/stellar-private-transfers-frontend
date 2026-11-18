import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  buildPrivateTransferAssets,
  filterPaymentCatalog,
  useGetAssetsQuery,
} from "@/entities/asset";
import { selectNativeXlmPaymentCatalog } from "@/entities/wallet";
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
  const nativeXlmOnly = useAppSelector(selectNativeXlmPaymentCatalog);
  const { data: assetCatalog } = useGetAssetsQuery();
  const catalogList = useMemo(() => {
    const paymentCatalog = filterPaymentCatalog(assetCatalog, nativeXlmOnly);
    return paymentCatalog === undefined ? undefined : [...paymentCatalog];
  }, [assetCatalog, nativeXlmOnly]);
  const aggregatesWithZeroAssets = useMemo(() => {
    return withZeroAmountPrivateAssetRows(aggregates, catalogList);
  }, [aggregates, catalogList]);
  const privateAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, catalogList),
    [aggregatesWithZeroAssets, catalogList],
  );
  const tokenUi = useSelectedPrivateToken(privateAssets, assetIdFromUrl);
  return { withdrawalSender, privateAssets, tokenUi };
}
