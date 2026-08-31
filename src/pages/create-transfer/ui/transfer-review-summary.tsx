import React from "react";
import { Mail } from "lucide-react";

export function TransferReviewSummary(properties: {
  transferLabel: string;
  reviewAmount: string;
  nameLabel: string;
  recipientName: string;
  recipientLabel: string;
  recipientDisplay: string;
  amountLabel: string;
}): React.JSX.Element {
  return (
    <>
      <div className="send-review-modal__summary">
        <div>
          <p className="send-review-modal__eyebrow">{properties.transferLabel}</p>
          <p className="send-review-modal__amount">{properties.reviewAmount}</p>
        </div>
        <span className="send-review-modal__method" aria-hidden="true">
          <Mail size={32} strokeWidth={1.6} />
        </span>
      </div>
      <div className="send-review-details">
        <div className="send-review-detail-row">
          <span>{properties.nameLabel}</span>
          <span>{properties.recipientName}</span>
        </div>
        <div className="send-review-detail-row">
          <span>{properties.recipientLabel}</span>
          <span className="send-review-detail-row__mono">
            {properties.recipientDisplay}
          </span>
        </div>
        <div className="send-review-detail-row">
          <span>{properties.amountLabel}</span>
          <span>{properties.reviewAmount}</span>
        </div>
      </div>
    </>
  );
}
