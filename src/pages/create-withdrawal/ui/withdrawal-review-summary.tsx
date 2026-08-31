import React from "react";
import { Wallet } from "lucide-react";

export function WithdrawalReviewSummary(properties: {
  withdrawalLabel: string;
  reviewAmount: string;
  nameLabel: string;
  walletName: string;
  destinationLabel: string;
  destinationDisplay: string;
  amountLabel: string;
}): React.JSX.Element {
  return (
    <>
      <div className="send-review-modal__summary">
        <div>
          <p className="send-review-modal__eyebrow">{properties.withdrawalLabel}</p>
          <p className="send-review-modal__amount">{properties.reviewAmount}</p>
        </div>
        <span className="send-review-modal__method" aria-hidden="true">
          <Wallet size={32} strokeWidth={1.6} />
        </span>
      </div>
      <div className="send-review-details">
        <div className="send-review-detail-row">
          <span>{properties.nameLabel}</span>
          <span>{properties.walletName}</span>
        </div>
        <div className="send-review-detail-row">
          <span>{properties.destinationLabel}</span>
          <span className="send-review-detail-row__mono">
            {properties.destinationDisplay}
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
