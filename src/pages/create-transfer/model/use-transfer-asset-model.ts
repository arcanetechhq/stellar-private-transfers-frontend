import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { filterPaymentCatalog, useGetAssetsQuery } from "@/entities/asset";
import { selectNativeXlmPaymentCatalog } from "@/entities/wallet";
import {
  selectFinalizedAggregatesForPrivateAddress,
  withZeroAmountPrivateAssetRows,
} from "@/entities/coin";
import { buildPrivateTransferAssets } from "../lib/private-transfer-asset-list";
import { useSelectedPrivateToken } from "./use-selected-private-token";
import { useTransferAmountInputs } from "./use-transfer-amount-inputs";

export function useTransferAssetModel(input: {
  senderPrivateAddress: string;
  assetIdFromUrl: string | null;
  recipientFromUrl?: string;
}) {
  const { senderPrivateAddress, assetIdFromUrl } = input;
  const recipientFromUrl = input.recipientFromUrl ?? "";
  const aggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(
      state,
      senderPrivateAddress || undefined,
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
  const privateTransferAssets = useMemo(
    () => buildPrivateTransferAssets(aggregatesWithZeroAssets, catalogList),
    [aggregatesWithZeroAssets, catalogList],
  );
  const tokenUi = useSelectedPrivateToken(
    privateTransferAssets,
    assetIdFromUrl,
  );
  const amountInputs = useTransferAmountInputs(
    tokenUi.selectedToken,
    recipientFromUrl,
  );
  return {
    assets: privateTransferAssets,
    tokenUi,
    amountInputs,
    selectedAsset: tokenUi.selectedToken,
  };
}
