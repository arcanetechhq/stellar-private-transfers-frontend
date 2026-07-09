import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";
import { AssetRowIcon } from "@/shared/ui/asset-row-icon";
import {
  formatAggregatedBalance,
  formatUsdAmount,
} from "../lib/format-asset-balance-amount";

type PrivateAssetRowProperties = {
  row: AggregatedPrivateAssetRow;
  assetName: string;
  logoUrl?: string | null;
  usdAmount: number;
};

export function PrivateAssetRow({
  row,
  assetName,
  logoUrl,
  usdAmount,
}: PrivateAssetRowProperties) {
  const navigate = useNavigate();
  const { t: translate } = useTranslation("assets");
  const ticker = row.assetId.toUpperCase();

  function handleSend() {
    navigate(
      `/create-transfer?assetId=${encodeURIComponent(row.assetId)}`,
    );
  }

  return (
    <button
      type="button"
      className="asset-balance-row"
      aria-label={translate("privateAssets.sendAsset", { asset: ticker })}
      onClick={handleSend}
    >
      <AssetRowIcon ticker={ticker} logoUrl={logoUrl} />
      <span className="asset-balance-row__identity">
        <span className="asset-balance-row__title">
          <span className="asset-balance-row__code">{ticker}</span>
          <span className="asset-balance-row__badge">
            {translate("privateAssets.networkStellar")}
          </span>
        </span>
        <span className="asset-balance-row__name">{assetName}</span>
      </span>
      <span className="asset-balance-row__amount">
        <span className="asset-balance-row__balance">
          {formatAggregatedBalance(row.totalAmountDisplay)} {ticker}
        </span>
        <span className="asset-balance-row__fiat">
          ${formatUsdAmount(usdAmount)}
        </span>
      </span>
    </button>
  );
}
