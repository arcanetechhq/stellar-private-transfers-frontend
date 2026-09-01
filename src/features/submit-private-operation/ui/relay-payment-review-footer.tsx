import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentReviewFooter } from "@/shared/ui/payment-review-footer";
import { shouldShowRelayWaitingNotice } from "../lib/relay-waiting-notice.js";
import { RelayReviewActions } from "./relay-review-actions.js";

export function RelayPaymentReviewFooter(properties: {
  cancelLabel: string;
  confirmLabel: string;
  isSubmitting: boolean;
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onFallback: () => void;
  confirmTestId?: string;
}): React.JSX.Element {
  const { t: translate } = useTranslation("relay");
  const isWaiting = shouldShowRelayWaitingNotice({
    isSubmitting: properties.isSubmitting,
    fallbackAllowed: properties.fallbackAllowed,
  });
  return (
    <PaymentReviewFooter
      cancelLabel={properties.cancelLabel}
      confirmLabel={properties.confirmLabel}
      submittingLabel={
        isWaiting ? translate("waitingForProtocol") : properties.confirmLabel
      }
      isSubmitting={properties.isSubmitting}
      showConfirm={!properties.retryAllowed && !properties.fallbackAllowed}
      confirmTestId={properties.confirmTestId}
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
  );
}
