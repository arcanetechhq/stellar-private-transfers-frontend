import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchSorobanTransactionDetails,
  selectChainDetailsForHash,
  selectTransactionById,
} from "@/entities/transaction";
import type { AssetDto } from "@/entities/asset";

export function useTransactionDetailsData(transactionId: string | undefined) {
  const dispatch = useAppDispatch();
  const decodedId = transactionId
    ? decodeURIComponent(transactionId).trim()
    : "";
  const storedTransaction = useAppSelector(
    selectTransactionById(decodedId),
  );
  const chainEntry = useAppSelector(selectChainDetailsForHash(decodedId));

  useEffect(() => {
    if (!decodedId) {
      return;
    }
    void dispatch(fetchSorobanTransactionDetails(decodedId));
  }, [decodedId, dispatch]);

  const chainMatchedAsset: AssetDto | undefined = undefined;

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
