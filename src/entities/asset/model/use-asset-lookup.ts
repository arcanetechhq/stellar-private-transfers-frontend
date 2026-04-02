import { useMemo } from "react";
import { useGetAssetsQuery } from "../api/asset-api";
import type { AssetDto } from "../api/asset-api";

export function useAssetLookup(): Map<string, AssetDto> {
  const { data } = useGetAssetsQuery();
  return useMemo(() => {
    const map = new Map<string, AssetDto>();
    for (const asset of data ?? []) {
      map.set(asset.assetId, asset);
    }
    return map;
  }, [data]);
}

export function useAssetByPoolContract(
  poolContract: string | null | undefined,
): AssetDto | undefined {
  const { data } = useGetAssetsQuery();
  return useMemo(() => {
    const normalized = poolContract?.trim();
    if (!normalized) {
      return;
    }
    return data?.find(
      (asset) => asset.poolContract?.trim() === normalized,
    );
  }, [data, poolContract]);
}
