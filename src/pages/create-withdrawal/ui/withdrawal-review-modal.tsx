import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import type { AssetWithTrustline } from "@/entities/asset";
import { RelayReviewActions } from "@/features/submit-private-operation";
import { PaymentReviewFooter } from "@/shared/ui/payment-review-footer";
import { formatWithdrawalAmount, parseWithdrawalAmountInput } from "../lib/format-withdrawal-amount";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { WithdrawalReviewSummary } from "./withdrawal-review-summary";

interface WithdrawalReviewModalProperties {
  open: boolean;
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  retryAllowed?: boolean;
  fallbackAllowed?: boolean;
  onRetry?: () => void;
  onFallback?: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

function WithdrawalReviewDialog(properties: {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  onRetry: () => void;
  onFallback: () => void;
  onClose: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  const { t: translate } = useTranslation("withdrawal");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const providerLabel = useWalletProviderLabel();
  const ticker = properties.selectedToken?.assetId.toUpperCase() ?? "";
  const reviewAmount = `${formatWithdrawalAmount(parseWithdrawalAmountInput(properties.amount))} ${ticker}`.trim();
  const destinationTrim = publicKey?.trim() ?? "";
  const walletName = destinationTrim
    ? `${providerLabel} ${translate("walletProviderSuffix")}`
    : "—";
  const destinationDisplay = destinationTrim
    ? shortenStellarAddress(destinationTrim)
    : "—";
  return (
    <>
      <button
        type="button"
        className="ui-icon-button send-review-modal__close"
        aria-label={translate("review.close")}
        disabled={properties.isSubmitting}
        onClick={properties.onClose}
      >
        <X aria-hidden="true" size={16} strokeWidth={1.7} />
      </button>
      <div className="send-review-modal__header">
        <h2 id="withdrawal-review-title" className="send-review-modal__title">
          {translate("review.title")}
        </h2>
      </div>
      <WithdrawalReviewSummary
        withdrawalLabel={translate("review.withdrawalLabel")}
        reviewAmount={reviewAmount}
        nameLabel={translate("review.name")}
        walletName={walletName}
        destinationLabel={translate("destinationWallet")}
        destinationDisplay={destinationDisplay}
        amountLabel={translate("review.amount")}
      />
      {properties.submitError ? (
        <div className="send-money-error" role="alert">
          {properties.submitError}
        </div>
      ) : undefined}
      <PaymentReviewFooter
        cancelLabel={translate("review.cancel")}
        confirmLabel={translate("sendWithdrawal")}
        submittingLabel={translate("submitting")}
        isSubmitting={properties.isSubmitting}
        showConfirm={!properties.retryAllowed && !properties.fallbackAllowed}
        onClose={properties.onClose}
        onConfirm={properties.onConfirm}
        extra={
          <RelayReviewActions
            retryAllowed={properties.retryAllowed}
            fallbackAllowed={properties.fallbackAllowed}
            disabled={properties.isSubmitting}
            onRetry={properties.onRetry}
            onFallback={properties.onFallback}
          />
        }
      />
    </>
  );
}

export function WithdrawalReviewModal({
  open,
  selectedToken,
  amount,
  isSubmitting,
  submitError,
  retryAllowed,
  fallbackAllowed,
  onRetry,
  onFallback,
  onClose,
  onConfirm,
}: WithdrawalReviewModalProperties): React.JSX.Element | undefined {
  if (!open) {
    return undefined;
  }
  return (
    <div
      className="send-review-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="send-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-review-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <WithdrawalReviewDialog
          selectedToken={selectedToken}
          amount={amount}
          isSubmitting={isSubmitting}
          submitError={submitError}
          retryAllowed={Boolean(retryAllowed)}
          fallbackAllowed={Boolean(fallbackAllowed)}
          onRetry={() => onRetry?.()}
          onFallback={() => onFallback?.()}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
