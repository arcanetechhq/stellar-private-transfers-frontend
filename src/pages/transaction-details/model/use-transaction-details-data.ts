import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchSorobanTransactionDetails,
  selectChainDetailsForHash,
  selectTransactionById,
} from "@/entities/transaction";
import { useGetAssetsQuery, type AssetDto } from "@/entities/asset";

export function useTransactionDetailsData(transactionId: string | undefined) {
  const dispatch = useAppDispatch();
  const decodedId = transactionId
    ? decodeURIComponent(transactionId).trim()
    : "";
  const storedTransaction = useAppSelector(
    selectTransactionById(decodedId),
  );
  const chainEntry = useAppSelector(selectChainDetailsForHash(decodedId));
  const { data: assets } = useGetAssetsQuery();

  useEffect(() => {
    if (!decodedId) {
      return;
    }
    void dispatch(fetchSorobanTransactionDetails(decodedId));
  }, [decodedId, dispatch]);

  const chainMatchedAsset: AssetDto | undefined = useMemo(() => {
    if (chainEntry?.status !== "succeeded") {
      return;
    }
    const poolId = chainEntry.data.invokedPoolContractId?.trim();
    if (!poolId || !assets) {
      return;
    }
    return assets.find((asset) => asset.poolContract?.trim() === poolId);
  }, [assets, chainEntry]);

  const chainTransferAmountRaw =
    chainEntry?.status === "succeeded"
      ? chainEntry.data.transferAmountRaw
      : undefined;

  const chainCreatedAtSeconds =
    chainEntry?.status === "succeeded"
      ? chainEntry.data.createdAt
      : undefined;

  return {
    decodedTransactionId: decodedId,
    storedTransaction,
    hasPrivateRecord: Boolean(storedTransaction),
    chainEntry,
    chainMatchedAsset,
    chainTransferAmountRaw,
    chainCreatedAtSeconds,
  };
}
