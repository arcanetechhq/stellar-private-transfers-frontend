import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PrivateWithdrawalSuccess } from "../model/private-withdrawal-success";
import { formatWithdrawalAmount } from "../lib/format-withdrawal-amount";

interface WithdrawalSuccessModalProperties {
  open: boolean;
  result: PrivateWithdrawalSuccess | undefined;
  destinationLabel: string;
  onDone: () => void;
}

export function WithdrawalSuccessModal({
  open,
  result,
  destinationLabel,
  onDone,
}: WithdrawalSuccessModalProperties): React.JSX.Element | null {
  const { t: translate } = useTranslation("withdrawal");

  if (!open || !result) {
    return null;
  }

  const ticker = result.assetId.toUpperCase();
  const amountDisplay = `${formatWithdrawalAmount(result.amount)} ${ticker}`.trim();

  return (
    <div className="send-success-backdrop" role="presentation">
      <div
        className="send-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-success-title"
      >
        <div className="send-success-content">
          <span className="send-success-icon" aria-hidden="true">
            <Check size={48} strokeWidth={1.7} />
          </span>
          <div className="send-success-text">
            <h2 id="withdrawal-success-title" className="send-success-title">
              {translate("success.title")}
            </h2>
            <p className="send-success-description">
              {translate("success.sentToDestination", {
                destination: destinationLabel,
              })}
            </p>
          </div>
          <p className="send-success-amount">{amountDisplay}</p>
        </div>

        {result.coinDeliveryWarning ? (
          <div role="status" className="send-success-warning">
            {result.coinDeliveryWarning}
          </div>
        ) : null}

        <div className="send-success-footer">
          <button
            type="button"
            className="send-money-continue"
            onClick={onDone}
          >
            {translate("success.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
