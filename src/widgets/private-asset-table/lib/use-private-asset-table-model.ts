import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice, useGetAssetsQuery } from "@/entities/asset";
import {
  selectFirstPrivateAddressWithFinalizedCoins,
  selectFinalizedAggregatesForPrivateAddress,
} from "@/entities/coin";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

export function usePrivateAssetTableModel() {
  const defaultNonce = useAppSelector(selectDefaultNonce);
  const selectedPrivateAddress = useAppSelector((state) =>
    selectPrivateAddressByNonce(defaultNonce ?? "")(
      state,
    )?.privateAddress.trim(),
  );
  const fallbackPrivateAddress = useAppSelector(
    selectFirstPrivateAddressWithFinalizedCoins,
  );
  const selectedAggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(state, selectedPrivateAddress),
  );
  const fallbackAggregates = useAppSelector((state) =>
    selectFinalizedAggregatesForPrivateAddress(state, fallbackPrivateAddress),
  );
  const useFallbackAggregates =
    selectedAggregates.length === 0 && fallbackAggregates.length > 0;
  const effectivePrivateAddress = useFallbackAggregates
    ? fallbackPrivateAddress
    : selectedPrivateAddress;
  const aggregates = useFallbackAggregates
    ? fallbackAggregates
    : selectedAggregates;
  const { data: assetCatalog } = useGetAssetsQuery();

  const aggregatesWithZeroAssets = useMemo(() => {
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
  }, [aggregates, assetCatalog]);

  const assetMetaById = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    if (!assetCatalog) {
      return map;
    }
    for (const dto of assetCatalog) {
      map.set(dto.assetId, { name: dto.name, logoUrl: dto.logoUrl });
    }
    return map;
  }, [assetCatalog]);

  const assetUsdPriceById = useMemo(() => {
    const map = new Map<string, number>();
    if (!assetCatalog) {
      return map;
    }
    for (const dto of assetCatalog) {
      map.set(dto.assetId, getAssetUsdPrice(dto.assetId));
    }
    return map;
  }, [assetCatalog]);

  return {
    effectivePrivateAddress,
    aggregatesWithZeroAssets,
    assetMetaById,
    assetUsdPriceById,
  };
}
