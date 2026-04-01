import { useAppSelector } from "@/app/hooks";
import {
  selectAssetCount,
  selectPortfolioAssets,
  selectTotalBalanceUsd,
} from "@/entities/asset";

export function usePortfolioAssets() {
  const assets = useAppSelector(selectPortfolioAssets);
  const totalBalanceUSD = useAppSelector(selectTotalBalanceUsd);
  const assetCount = useAppSelector(selectAssetCount);

  return {
    assets,
    totalBalanceUSD,
    assetCount,
  };
}
