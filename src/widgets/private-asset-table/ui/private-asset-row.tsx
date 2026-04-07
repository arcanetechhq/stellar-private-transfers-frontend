import React from "react";
import { Link } from "react-router";
import { Send, ArrowUpFromLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
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
  const { t: translate } = useTranslation("assets");
  const ticker = row.assetId.toUpperCase();

  return (
    <div className="px-6 py-4 transition-colors hover:bg-[var(--surface-hover)]">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-4 flex items-center gap-4">
          <TokenIcon ticker={ticker} logoUrl={logoUrl} size={44} />
          <div>
            <p className="mb-0.5 text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
              {ticker}
            </p>
            <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
              {assetName}
            </p>
          </div>
        </div>

        <div className="col-span-3">
          <p className="text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            {formatAggregatedBalance(row.totalAmountDisplay)}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
            {ticker}
          </p>
        </div>

        <div className="col-span-2 text-right">
          <p className="text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            ${formatUsdAmount(usdAmount)}
          </p>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-2">
          <Link
            to={`/create-transfer?assetId=${encodeURIComponent(row.assetId)}`}
            className="block w-24"
          >
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-[13px] leading-[18px] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
            >
              <Send className="h-3.5 w-3.5" />
              {translate("trustline.send")}
            </button>
          </Link>
          <Link
            to={`/withdraw?assetId=${encodeURIComponent(row.assetId)}`}
            className="block w-24"
          >
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-[13px] leading-[18px] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
            >
              <ArrowUpFromLine
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2.25}
              />
              {translate("trustline.withdraw")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
