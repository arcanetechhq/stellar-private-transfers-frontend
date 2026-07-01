import { Loader2, Wallet, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey, useWalletProviderLabel } from "@/entities/wallet";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatWithdrawalAmount, parseWithdrawalAmountInput } from "../lib/format-withdrawal-amount";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface WithdrawalReviewModalProperties {
  open: boolean;
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawalReviewModal({
  open,
  selectedToken,
  amount,
  isSubmitting,
  submitError,
  onClose,
  onConfirm,
}: WithdrawalReviewModalProperties): React.JSX.Element | null {
  const { t: translate } = useTranslation("withdrawal");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const providerLabel = useWalletProviderLabel();
  const ticker = selectedToken?.assetId.toUpperCase() ?? "";
  const reviewAmount = `${formatWithdrawalAmount(parseWithdrawalAmountInput(amount))} ${ticker}`.trim();
  const destinationTrim = publicKey?.trim() ?? "";
  const walletName = destinationTrim
    ? `${providerLabel} ${translate("walletProviderSuffix")}`
    : "—";
  const destinationDisplay = destinationTrim
    ? shortenStellarAddress(destinationTrim)
    : "—";

  if (!open) {
    return null;
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
        <button
          type="button"
          className="ui-icon-button send-review-modal__close"
          aria-label={translate("review.close")}
          disabled={isSubmitting}
          onClick={onClose}
        >
          <X aria-hidden="true" size={16} strokeWidth={1.7} />
        </button>

        <div className="send-review-modal__header">
          <h2 id="withdrawal-review-title" className="send-review-modal__title">
            {translate("review.title")}
          </h2>
        </div>

        <div className="send-review-modal__summary">
          <div>
            <p className="send-review-modal__eyebrow">{translate("review.withdrawalLabel")}</p>
            <p className="send-review-modal__amount">{reviewAmount}</p>
          </div>
          <span className="send-review-modal__method" aria-hidden="true">
            <Wallet size={32} strokeWidth={1.6} />
          </span>
        </div>

        <div className="send-review-details">
          <div className="send-review-detail-row">
            <span>{translate("review.name")}</span>
            <span>{walletName}</span>
          </div>
          <div className="send-review-detail-row">
            <span>{translate("destinationWallet")}</span>
            <span className="send-review-detail-row__mono">{destinationDisplay}</span>
          </div>
          <div className="send-review-detail-row">
            <span>{translate("review.amount")}</span>
            <span>{reviewAmount}</span>
          </div>
        </div>

        {submitError ? (
          <div className="send-money-error" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="send-review-actions">
          <button
            type="button"
            className="send-review-action send-review-action--cancel"
            disabled={isSubmitting}
            onClick={onClose}
          >
            {translate("review.cancel")}
          </button>
          <button
            type="button"
            className="send-review-action send-review-action--send"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isSubmitting ? translate("submitting") : translate("sendWithdrawal")}
          </button>
        </div>
      </div>
    </div>
  );
}
