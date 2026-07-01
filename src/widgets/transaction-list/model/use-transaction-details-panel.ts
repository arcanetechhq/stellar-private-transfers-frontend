import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchSorobanTransactionDetails,
  selectChainDetailsForHash,
} from "@/entities/transaction";

export function useTransactionDetailsPanel(transactionId: string) {
  const dispatch = useAppDispatch();
  const chainEntry = useAppSelector(selectChainDetailsForHash(transactionId));

  useEffect(() => {
    void dispatch(fetchSorobanTransactionDetails(transactionId));
  }, [dispatch, transactionId]);

  return { chainEntry };
}
