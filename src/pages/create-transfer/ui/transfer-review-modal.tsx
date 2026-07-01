import { Loader2, Mail, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectContacts } from "@/entities/contact";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatTransferAmount } from "../lib/format-transfer-amount";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface TransferReviewModalProperties {
  open: boolean;
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  onClose: () => void;
  onConfirm: () => void;
}

export function TransferReviewModal({
  open,
  selectedToken,
  amount,
  recipient,
  isSubmitting,
  submitError,
  onClose,
  onConfirm,
}: TransferReviewModalProperties): React.JSX.Element | null {
  const { t: translate } = useTranslation("transfer");
  const contacts = useAppSelector(selectContacts);
  const recipientTrim = recipient.trim();
  const selectedContact =
    contacts.find((contact) => contact.stellarAddress.trim() === recipientTrim) ??
    null;
  const ticker = selectedToken?.assetId.toUpperCase() ?? "";
  const reviewAmount = `${formatTransferAmount(Number.parseFloat(amount) || 0)} ${ticker}`.trim();
  const recipientName =
    selectedContact?.name ??
    (recipientTrim ? translate("manualRecipient") : "—");
  const recipientDisplay = recipientTrim
    ? shortenStellarAddress(recipientTrim)
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
        aria-labelledby="transfer-review-title"
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
          <h2 id="transfer-review-title" className="send-review-modal__title">
            {translate("review.title")}
          </h2>
        </div>

        <div className="send-review-modal__summary">
          <div>
            <p className="send-review-modal__eyebrow">{translate("review.transferLabel")}</p>
            <p className="send-review-modal__amount">{reviewAmount}</p>
          </div>
          <span className="send-review-modal__method" aria-hidden="true">
            <Mail size={32} strokeWidth={1.6} />
          </span>
        </div>

        <div className="send-review-details">
          <div className="send-review-detail-row">
            <span>{translate("review.name")}</span>
            <span>{recipientName}</span>
          </div>
          <div className="send-review-detail-row">
            <span>{translate("recipient")}</span>
            <span className="send-review-detail-row__mono">{recipientDisplay}</span>
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
            {isSubmitting ? translate("submitting") : translate("privateSend")}
          </button>
        </div>
      </div>
    </div>
  );
}
