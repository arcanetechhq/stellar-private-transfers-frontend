import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectContacts } from "@/entities/contact";
import type { AssetWithTrustline } from "@/entities/asset";
import { RelayReviewActions } from "@/features/submit-private-operation";
import { PaymentReviewFooter } from "@/shared/ui/payment-review-footer";
import { formatTransferAmount } from "../lib/format-transfer-amount";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { TransferReviewSummary } from "./transfer-review-summary";

interface TransferReviewModalProperties {
  open: boolean;
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  retryAllowed?: boolean;
  fallbackAllowed?: boolean;
  onRetry?: () => void;
  onFallback?: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

function readTransferReviewCopy(input: {
  amount: string;
  recipient: string;
  selectedToken: AssetWithTrustline | undefined;
  contacts: { name: string; stellarAddress: string }[];
  manualRecipientLabel: string;
}): {
  reviewAmount: string;
  recipientName: string;
  recipientDisplay: string;
} {
  const recipientTrim = input.recipient.trim();
  const selectedContact = input.contacts.find(
    (contact) => contact.stellarAddress.trim() === recipientTrim,
  );
  const ticker = input.selectedToken?.assetId.toUpperCase() ?? "";
  return {
    reviewAmount: `${formatTransferAmount(Number.parseFloat(input.amount) || 0)} ${ticker}`.trim(),
    recipientName: selectedContact?.name ?? (recipientTrim ? input.manualRecipientLabel : "—"),
    recipientDisplay: recipientTrim ? shortenStellarAddress(recipientTrim) : "—",
  };
}

function TransferReviewDialog(properties: {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  isSubmitting: boolean;
  submitError: string | undefined;
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  onRetry: () => void;
  onFallback: () => void;
  onClose: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  const { t: translate } = useTranslation("transfer");
  const contacts = useAppSelector(selectContacts);
  const copy = readTransferReviewCopy({
    amount: properties.amount,
    recipient: properties.recipient,
    selectedToken: properties.selectedToken,
    contacts,
    manualRecipientLabel: translate("manualRecipient"),
  });
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
        <h2 id="transfer-review-title" className="send-review-modal__title">
          {translate("review.title")}
        </h2>
      </div>
      <TransferReviewSummary
        transferLabel={translate("review.transferLabel")}
        reviewAmount={copy.reviewAmount}
        nameLabel={translate("review.name")}
        recipientName={copy.recipientName}
        recipientLabel={translate("recipient")}
        recipientDisplay={copy.recipientDisplay}
        amountLabel={translate("review.amount")}
      />
      {properties.submitError ? (
        <div className="send-money-error" role="alert">
          {properties.submitError}
        </div>
      ) : undefined}
      <PaymentReviewFooter
        cancelLabel={translate("review.cancel")}
        confirmLabel={translate("privateSend")}
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

export function TransferReviewModal({
  open,
  selectedToken,
  amount,
  recipient,
  isSubmitting,
  submitError,
  retryAllowed,
  fallbackAllowed,
  onRetry,
  onFallback,
  onClose,
  onConfirm,
}: TransferReviewModalProperties): React.JSX.Element | undefined {
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
        aria-labelledby="transfer-review-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <TransferReviewDialog
          selectedToken={selectedToken}
          amount={amount}
          recipient={recipient}
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
