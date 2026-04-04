import React from "react";
import { ArrowUpFromLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface SummaryLineItemsProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  networkFee: number;
}

function SummaryLineItems({ selectedToken, amount, networkFee }: SummaryLineItemsProperties) {
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
          {translate("asset")}
        </span>
        <span className="text-[14px] leading-5 font-semibold text-[var(--foreground-primary)]">
          {ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
          {translate("amount")}
        </span>
        <span className="text-[14px] leading-5 font-semibold text-[var(--foreground-primary)]">
          {amount || translate("amountPlaceholder")}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
          {translate("networkFee")}
        </span>
        <span className="text-[14px] leading-5 font-semibold text-[var(--foreground-primary)]">
          ${networkFee.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

interface ConfirmButtonProperties {
  canSubmit: boolean;
  isSubmitting: boolean;
}

function ConfirmButton({ canSubmit, isSubmitting }: ConfirmButtonProperties) {
  const { t: translate } = useTranslation("withdrawal");

  return (
    <button
      type="submit"
      disabled={!canSubmit || isSubmitting}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-[15px] leading-[22px] font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--foreground-tertiary)]"
    >
      <ArrowUpFromLine className="h-4 w-4" />
      {isSubmitting ? translate("submitting") : translate("confirmWithdrawal")}
    </button>
  );
}

interface WithdrawalSummaryProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  networkFee: number;
  receivedAmount: number;
  destinationWallet: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | undefined;
}

export function WithdrawalSummary({
  selectedToken,
  amount,
  networkFee,
  receivedAmount,
  destinationWallet,
  canSubmit,
  isSubmitting,
  submitError,
}: WithdrawalSummaryProperties) {
  const { t: translate } = useTranslation("withdrawal");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";
  const trimmedDestination = destinationWallet.trim();
  const destinationDisplay =
    trimmedDestination === "" ? "—" : shortenStellarAddress(trimmedDestination);

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-4 text-base leading-6 font-semibold text-[var(--foreground-primary)]">
          {translate("summary")}
        </h3>
        {submitError ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-[var(--error)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error-foreground)]"
          >
            {submitError}
          </div>
        ) : undefined}
        <SummaryLineItems
          selectedToken={selectedToken}
          amount={amount}
          networkFee={networkFee}
        />
        <div className="mb-6 border-t border-[var(--border)] pt-4">
          <div className="mb-3 flex justify-between">
            <span className="text-[15px] leading-[22px] font-semibold text-[var(--foreground-primary)]">
              {translate("toReceive")}
            </span>
            <span className="text-[15px] leading-[22px] font-semibold text-[var(--foreground-primary)]">
              {receivedAmount.toLocaleString()} {ticker}
            </span>
          </div>
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
            <p className="mb-1 text-[12px] leading-4 text-[var(--foreground-secondary)]">
              {translate("destination")}
            </p>
            <p
              className="min-w-0 truncate font-mono text-[13px] leading-[18px] font-semibold text-[var(--foreground-primary)]"
              title={trimmedDestination === "" ? undefined : trimmedDestination}
            >
              {destinationDisplay}
            </p>
          </div>
        </div>
        <ConfirmButton canSubmit={canSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
