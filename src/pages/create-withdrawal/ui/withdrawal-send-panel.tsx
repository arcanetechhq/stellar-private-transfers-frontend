import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  formatWithdrawalAmount,
  formatWithdrawalBalanceWithTicker,
  parseWithdrawalAmountInput,
  parseWithdrawalBalance,
} from "../lib/format-withdrawal-amount";
import { WithdrawalAssetSelect } from "./withdrawal-asset-select";
import { WithdrawalWalletControl } from "./withdrawal-wallet-control";

interface WithdrawalSendPanelProperties {
  assets: AssetWithTrustline[];
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  totalAmount: number;
  canContinue: boolean;
  isSubmitting: boolean;
  noteLimitAlert?: {
    title: string;
    subtitle: string;
  };
  onAmountChange: (value: string) => void;
  onTokenSelect: (asset: AssetWithTrustline) => void;
  onMaxAmount: () => void;
  onContinue: () => void;
}

export function WithdrawalSendPanel({
  assets,
  selectedToken,
  amount,
  totalAmount,
  canContinue,
  isSubmitting,
  noteLimitAlert,
  onAmountChange,
  onTokenSelect,
  onMaxAmount,
  onContinue,
}: WithdrawalSendPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("withdrawal");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "";
  const numericAmount = parseWithdrawalAmountInput(amount);
  const numericBalance = parseWithdrawalBalance(selectedToken?.balance);
  const hasAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const exceedsBalance =
    hasAmount &&
    Number.isFinite(numericBalance) &&
    numericAmount > numericBalance;
  const amountInvalid = exceedsBalance || Boolean(noteLimitAlert);
  const recipientGetsDisplay = `${formatWithdrawalAmount(totalAmount)} ${ticker}`.trim();
  const feeDisplay = `0 ${ticker}`.trim();
  const availableBalanceDisplay = formatWithdrawalBalanceWithTicker(
    selectedToken?.balance,
    ticker,
  );

  return (
    <div className="transfer-send-panel">
      <div className="send-money-card">
        <WithdrawalWalletControl />
        <WithdrawalAssetSelect
          assets={assets}
          selectedAsset={selectedToken}
          onSelect={onTokenSelect}
        />
        <div className="send-money-amount-panel">
          <div
            className="send-money-amount-row"
            data-invalid={amountInvalid ? "true" : undefined}
          >
            <div className="send-money-amount-row__meta">
              <span>{translate("youSend")}</span>
              <span>
                {translate("availableForMax", {
                  amount: availableBalanceDisplay,
                })}
              </span>
            </div>
            <div className="send-money-amount-row__input">
              <input
                aria-label={translate("amount")}
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
              />
              <span className="send-money-amount-code">{ticker}</span>
              <button
                type="button"
                className="send-money-max"
                onClick={onMaxAmount}
              >
                {translate("max")}
              </button>
            </div>
          </div>
          <div className="send-money-amount-row send-money-amount-row--output">
            <div className="send-money-amount-row__meta">
              <span>{translate("recipientGets")}</span>
            </div>
            <div className="send-money-amount-row__input">
              <span className="send-money-value">
                {hasAmount ? recipientGetsDisplay : "0"}
              </span>
            </div>
          </div>
        </div>

        {noteLimitAlert ? (
          <div className="send-money-error" role="alert">
            <p className="send-money-error__title">{noteLimitAlert.title}</p>
            <p className="send-money-error__subtitle">{noteLimitAlert.subtitle}</p>
          </div>
        ) : null}

        {hasAmount ? (
          <div className="send-money-summary-row">
            <span>{translate("fee")}</span>
            <span className="send-money-summary-row__value">{feeDisplay}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="send-money-continue"
        disabled={!canContinue || isSubmitting}
        onClick={onContinue}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {translate("continue")}
      </button>
    </div>
  );
}
