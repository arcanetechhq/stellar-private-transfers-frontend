import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { type AssetDto, useGetAssetsQuery } from "@/entities/asset";
import {
  type AggregatedPrivateAssetRow,
  selectFinalizedAggregatesForPrivateAddress,
} from "@/entities/coin";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { buildPrivateTransferAssets } from "../lib/private-transfer-asset-list";
import { useSelectedPrivateToken } from "./use-selected-private-token";
import { useTransferAmountInputs } from "./use-transfer-amount-inputs";

function withZeroAmountAssets(
  aggregates: AggregatedPrivateAssetRow[],
  assetCatalog: AssetDto[] | undefined,
): AggregatedPrivateAssetRow[] {
  const poolContract = getRequiredPrivacyPoolContractId();
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
        poolContract,
        totalAmountDisplay: 0,
      });
    }
  }
  return [...byAssetId.values()].toSorted((left, right) =>
    left.assetId.localeCompare(right.assetId),
  );
}

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
    return withZeroAmountAssets(aggregates, assetCatalog);
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
