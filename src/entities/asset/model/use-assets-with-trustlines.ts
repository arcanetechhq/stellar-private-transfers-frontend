import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  fetchAccountBalances,
  type StellarBalance,
} from "@/shared/stellar/fetch-account-balances";
import { horizonServer } from "@/shared/stellar/horizon-server";
import { useGetAssetsQuery } from "../api/asset-api";
import { selectAssetTrustlineRefreshGeneration } from "./asset-trustline-refresh-slice";
import type { AssetDto } from "../api/asset-api";
import type { AssetWithTrustline } from "./asset";

interface ResolveOptions {
  backendAssets: AssetDto[] | undefined;
  stellarBalances: StellarBalance[] | undefined;
  isTrustlineLoading: boolean;
}

function resolveAssets(options: ResolveOptions): AssetWithTrustline[] {
  const { backendAssets, stellarBalances, isTrustlineLoading } = options;
  if (!backendAssets) return [];

  return backendAssets.map((asset) => {
    if (asset.issuerAddress === undefined || asset.issuerAddress === null) {
      const nativeEntry = stellarBalances?.find(
        (entry) => entry.assetType === "native",
      );
      return {
        ...asset,
        trustlineStatus: "native",
        balance: nativeEntry?.balance ?? undefined,
      } as AssetWithTrustline;
    }

    if (isTrustlineLoading || stellarBalances === undefined) {
      return {
        ...asset,
        trustlineStatus: "loading",
        balance: undefined,
      } as AssetWithTrustline;
    }

    const match = stellarBalances.find(
      (entry) =>
        entry.assetCode?.toUpperCase() === asset.assetId.toUpperCase() &&
        entry.assetIssuer === asset.issuerAddress,
    );

    if (match) {
      return {
        ...asset,
        trustlineStatus: "exists",
        balance: match.balance,
      } as AssetWithTrustline;
    }

    return {
      ...asset,
      trustlineStatus: "missing",
      balance: undefined,
    } as AssetWithTrustline;
  });
}

export function useAssetsWithTrustlines(publicKey: string | undefined): {
  assets: AssetWithTrustline[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { data: backendAssets, isLoading: isBackendLoading } =
    useGetAssetsQuery();

  const trustlineRefreshGeneration = useAppSelector(
    selectAssetTrustlineRefreshGeneration,
  );

  const [stellarBalances, setStellarBalances] =
    useState<StellarBalance[] | undefined>();
  const [isTrustlineLoading, setIsTrustlineLoading] = useState(false);
  const [fetchCounter, setFetchCounter] = useState(0);

  const refetch = useCallback(() => {
    setFetchCounter((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!publicKey || !backendAssets) {
      setStellarBalances(undefined);
      return;
    }

    let cancelled = false;
    setIsTrustlineLoading(true);

    fetchAccountBalances(horizonServer, publicKey)
      .then((balances) => {
        if (!cancelled) {
          setStellarBalances(balances);
          setIsTrustlineLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStellarBalances([]);
          setIsTrustlineLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicKey, backendAssets, fetchCounter, trustlineRefreshGeneration]);

  const assets = resolveAssets({
    backendAssets,
    stellarBalances,
    isTrustlineLoading,
  });

  return {
    assets,
    isLoading: isBackendLoading || isTrustlineLoading,
    refetch,
  };
}
