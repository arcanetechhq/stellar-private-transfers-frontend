import { Send } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { shortenPrivateAddressForDisplay } from "@/shared/lib/private-address/shorten-private-address-for-display";
import type { AssetWithTrustline } from "@/entities/asset";
import { NETWORK_FEE } from "../model/create-transfer";

interface SummaryDetailsProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
}

function SummaryDetails({
  selectedToken,
  amount,
  recipient,
}: SummaryDetailsProperties) {
  const { t: translate } = useTranslation("transfer");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";
  const displayRecipient = recipient
    ? shortenPrivateAddressForDisplay(recipient.trim())
    : "—";

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("asset")}
        </span>
        <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
          {ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("amount")}
        </span>
        <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
          {amount || translate("amountPlaceholder")}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("recipient")}
        </span>
        <span className="font-mono text-[13px] leading-[18px] text-[var(--foreground-primary)]">
          {displayRecipient}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
          {translate("networkFee")}
        </span>
        <span className="text-sm leading-5 font-semibold text-[var(--foreground-primary)]">
          {NETWORK_FEE} {ticker}
        </span>
      </div>
    </div>
  );
}

interface SummaryFooterProperties {
  selectedToken: AssetWithTrustline | undefined;
  totalAmount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
}

function SummaryFooter({
  selectedToken,
  totalAmount,
  canSubmit,
  isSubmitting,
}: SummaryFooterProperties) {
  const { t: translate } = useTranslation("transfer");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";

  return (
    <>
      <div className="mb-6 border-t border-[var(--border)] pt-4">
        <div className="mb-3 flex justify-between">
          <span className="text-[15px] leading-[22px] font-semibold text-[var(--foreground-primary)]">
            {translate("total")}
          </span>
          <span className="text-[15px] leading-[22px] font-semibold text-[var(--foreground-primary)]">
            {totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {ticker}
          </span>
        </div>
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-3">
          <p className="mb-1 text-xs leading-4 text-[var(--foreground-secondary)]">
            {translate("type")}
          </p>
          <p className="text-[13px] leading-[18px] font-semibold text-[var(--foreground-primary)]">
            {translate("privateTransfer")}
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[15px] leading-[22px] font-semibold transition-colors enabled:cursor-pointer enabled:bg-[var(--primary)] enabled:text-[var(--primary-foreground)] enabled:hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--foreground-tertiary)]"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? translate("submitting") : translate("privateSend")}
      </button>
    </>
  );
}

export interface TransferSummaryProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  totalAmount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | undefined;
}

export function TransferSummary({
  selectedToken,
  amount,
  recipient,
  totalAmount,
  canSubmit,
  isSubmitting,
  submitError,
}: TransferSummaryProperties) {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="col-span-1">
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
        <SummaryDetails
          selectedToken={selectedToken}
          amount={amount}
          recipient={recipient}
        />
        <SummaryFooter
          selectedToken={selectedToken}
          totalAmount={totalAmount}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
