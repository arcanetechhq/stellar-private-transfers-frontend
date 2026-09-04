import React from "react";
import { PaymentReviewFooter } from "@/shared/ui/payment-review-footer";
import { RelayReviewActions } from "./relay-review-actions.js";

export function RelayPaymentReviewFooter(properties: {
  cancelLabel: string;
  confirmLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  retryAllowed: boolean;
  fallbackAllowed: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onFallback: () => void;
  confirmTestId?: string;
}): React.JSX.Element {
  return (
    <PaymentReviewFooter
      cancelLabel={properties.cancelLabel}
      confirmLabel={properties.confirmLabel}
      submittingLabel={properties.submittingLabel}
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
