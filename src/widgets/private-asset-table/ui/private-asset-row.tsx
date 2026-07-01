import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { AggregatedPrivateAssetRow } from "@/entities/coin";

const SMALL_BALANCE_THRESHOLD = 1;
const SMALL_BALANCE_MIN_FRACTION_DIGITS = 3;
const SMALL_BALANCE_MAX_FRACTION_DIGITS = 8;
const REGULAR_BALANCE_FRACTION_DIGITS = 2;
const USD_FRACTION_DIGITS = 2;

function formatAggregatedBalance(value: number): string {
  if (value < SMALL_BALANCE_THRESHOLD) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: SMALL_BALANCE_MIN_FRACTION_DIGITS,
      maximumFractionDigits: SMALL_BALANCE_MAX_FRACTION_DIGITS,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
    maximumFractionDigits: REGULAR_BALANCE_FRACTION_DIGITS,
  });
}

function formatUsdAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: USD_FRACTION_DIGITS,
    maximumFractionDigits: USD_FRACTION_DIGITS,
  });
}

function AssetRowIcon({
  ticker,
  logoUrl,
}: {
  ticker: string;
  logoUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const assetKey = ticker.toLowerCase();

  if (!logoUrl || failed) {
    return (
      <span className="asset-balance-row__icon" data-asset={assetKey}>
        <span
          aria-hidden="true"
          className="text-[13px] font-semibold text-[var(--text-muted)]"
        >
          {ticker.slice(0, 1)}
        </span>
      </span>
    );
  }

  return (
    <span className="asset-balance-row__icon" data-asset={assetKey}>
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        onError={() => {
          setFailed(true);
        }}
      />
    </span>
  );
}

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
