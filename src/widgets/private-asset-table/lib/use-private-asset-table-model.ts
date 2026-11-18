import { useMemo } from "react";
import { useAppSelector } from "@/store";
import {
  filterPaymentCatalog,
  getAssetUsdPrice,
  useGetAssetsQuery,
  type AssetDto,
} from "@/entities/asset";
import { selectNativeXlmPaymentCatalog } from "@/entities/wallet";
import {
  selectFirstPrivateAddressWithFinalizedCoins,
  selectFinalizedAggregatesForPrivateAddress,
  type AggregatedPrivateAssetRow,
} from "@/entities/coin";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

function withCatalogZeroRows(input: {
  aggregates: AggregatedPrivateAssetRow[];
  nativeXlmOnly: boolean;
  paymentCatalog: readonly AssetDto[] | undefined;
}): AggregatedPrivateAssetRow[] {
  const poolContract = getRequiredPrivacyPoolContractId();
  const allowed = input.nativeXlmOnly
    ? new Set((input.paymentCatalog ?? []).map((asset) => asset.assetId))
    : undefined;
  const visibleAggregates = allowed
    ? input.aggregates.filter((aggregate) => allowed.has(aggregate.assetId))
    : input.aggregates;
  const byAssetId = new Map(
    visibleAggregates.map((aggregate) => [aggregate.assetId, aggregate]),
  );
  if (input.paymentCatalog) {
    for (const asset of input.paymentCatalog) {
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
  const nativeXlmOnly = useAppSelector(selectNativeXlmPaymentCatalog);
  const { data: assetCatalog } = useGetAssetsQuery();
  const paymentCatalog = useMemo(
    () => filterPaymentCatalog(assetCatalog, nativeXlmOnly),
    [assetCatalog, nativeXlmOnly],
  );

  const aggregatesWithZeroAssets = useMemo(
    () =>
      withCatalogZeroRows({
        aggregates,
        nativeXlmOnly,
        paymentCatalog,
      }),
    [aggregates, nativeXlmOnly, paymentCatalog],
  );

  const assetMetaById = useMemo(() => {
    const map = new Map<string, { name: string; logoUrl: string | null }>();
    if (!paymentCatalog) {
      return map;
    }
    for (const dto of paymentCatalog) {
      map.set(dto.assetId, { name: dto.name, logoUrl: dto.logoUrl });
    }
    return map;
  }, [paymentCatalog]);

  const assetUsdPriceById = useMemo(() => {
    const map = new Map<string, number>();
    if (!paymentCatalog) {
      return map;
    }
    for (const dto of paymentCatalog) {
      map.set(dto.assetId, getAssetUsdPrice(dto.assetId));
    }
    return map;
  }, [paymentCatalog]);

  return {
    effectivePrivateAddress,
    aggregatesWithZeroAssets,
    assetMetaById,
    assetUsdPriceById,
  };
}
