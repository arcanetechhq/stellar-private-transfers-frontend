import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { ConfidentialTransferSuccess } from "../model/confidential-transfer-submit-flow";
import { formatTransferAmount } from "../lib/format-transfer-amount";

interface TransferSuccessModalProperties {
  open: boolean;
  result: ConfidentialTransferSuccess | undefined;
  recipientLabel: string;
  onDone: () => void;
}

export function TransferSuccessModal({
  open,
  result,
  recipientLabel,
  onDone,
}: TransferSuccessModalProperties): React.JSX.Element | null {
  const { t: translate } = useTranslation("transfer");

  if (!open || !result) {
    return null;
  }

  const ticker = result.assetId.toUpperCase();
  const amountDisplay =
    `${formatTransferAmount(result.amount)} ${ticker}`.trim();

  return (
    <div className="send-success-backdrop" role="presentation">
      <div
        className="send-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-success-title"
      >
        <div className="send-success-content">
          <span className="send-success-icon" aria-hidden="true">
            <Check size={48} strokeWidth={1.7} />
          </span>
          <div className="send-success-text">
            <h2 id="transfer-success-title" className="send-success-title">
              {translate("success.title")}
            </h2>
            <p className="send-success-description">
              {translate("success.sentToRecipient", {
                recipient: recipientLabel,
              })}
            </p>
          </div>
          <p className="send-success-amount">{amountDisplay}</p>
          <p hidden data-testid="tx-hash" title={result.txId}>
            {result.txId}
          </p>
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
            data-testid="transfer-success-done"
            onClick={onDone}
          >
            {translate("success.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
