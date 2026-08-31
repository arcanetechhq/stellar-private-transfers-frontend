import { Loader2 } from "lucide-react";
import React from "react";

export function PaymentReviewFooter(properties: {
  cancelLabel: string;
  confirmLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  showConfirm: boolean;
  onClose: () => void;
  onConfirm: () => void;
  extra?: React.ReactNode;
  confirmTestId?: string;
}): React.JSX.Element {
  return (
    <>
      {properties.extra}
      <div className="send-review-actions">
        <button
          type="button"
          className="send-review-action send-review-action--cancel"
          disabled={properties.isSubmitting}
          onClick={properties.onClose}
        >
          {properties.cancelLabel}
        </button>
        {properties.showConfirm ? (
          <button
            type="button"
            className="send-review-action send-review-action--send"
            data-testid={properties.confirmTestId}
            disabled={properties.isSubmitting}
            onClick={properties.onConfirm}
          >
            {properties.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : undefined}
            {properties.isSubmitting
              ? properties.submittingLabel
              : properties.confirmLabel}
          </button>
        ) : undefined}
      </div>
    </>
  );
}
