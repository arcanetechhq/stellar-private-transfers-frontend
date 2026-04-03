import React from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { shortenStealthForDisplay } from "@/shared/lib/stealth/shorten-stealth-for-display";

interface SummaryLineItemsProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  networkFee: number;
}

function SummaryLineItems({
  selectedToken,
  amount,
  networkFee,
}: SummaryLineItemsProperties) {
  const { t: translate } = useTranslation("deposit");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("asset")}
        </span>
        <span className="text-sm font-semibold leading-5 text-[var(--foreground-primary)]">
          {ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("amount")}
        </span>
        <span className="text-sm font-semibold leading-5 text-[var(--foreground-primary)]">
          {amount || "0.00"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("networkFee")}
        </span>
        <span className="text-sm font-semibold leading-5 text-[var(--foreground-primary)]">
          ${networkFee.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

interface SummaryReceiveInfoProperties {
  receivedAmount: number;
  ticker: string;
  destinationPreview: string;
}

function SummaryReceiveInfo({
  receivedAmount,
  ticker,
  destinationPreview,
}: SummaryReceiveInfoProperties) {
  const { t: translate } = useTranslation("deposit");
  const preview = destinationPreview.trim()
    ? shortenStealthForDisplay(destinationPreview.trim())
    : "—";

  return (
    <div className="mb-6 border-t border-[var(--border)] pt-4">
      <div className="mb-3 flex justify-between">
        <span className="text-[15px] font-semibold leading-[22px] text-[var(--foreground-primary)]">
          {translate("youWillReceive")}
        </span>
        <span className="text-[15px] font-semibold leading-[22px] text-[var(--foreground-primary)]">
          {receivedAmount.toLocaleString()} {ticker}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
        <p className="mb-1 text-xs leading-4 text-[var(--foreground-secondary)]">
          {translate("destination")}
        </p>
        <p className="font-mono text-[13px] font-semibold leading-[18px] text-[var(--foreground-primary)]">
          {preview}
        </p>
      </div>
    </div>
  );
}

interface DepositSummaryProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  networkFee: number;
  receivedAmount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  destinationPreview: string;
}

export function DepositSummary({
  selectedToken,
  amount,
  networkFee,
  receivedAmount,
  canSubmit,
  isSubmitting,
  destinationPreview,
}: DepositSummaryProperties) {
  const { t: translate } = useTranslation("deposit");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";

  return (
    <div className="sticky top-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h3 className="mb-4 text-base font-semibold leading-6 text-[var(--foreground-primary)]">
        {translate("summary")}
      </h3>
      <SummaryLineItems
        selectedToken={selectedToken}
        amount={amount}
        networkFee={networkFee}
      />
      <SummaryReceiveInfo
        receivedAmount={receivedAmount}
        ticker={ticker}
        destinationPreview={destinationPreview}
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-[15px] font-semibold leading-[22px] text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--foreground-tertiary)]"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {translate("confirmDeposit")}
      </button>
    </div>
  );
}
