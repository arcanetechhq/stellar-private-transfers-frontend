import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { NETWORK_FEE } from "../model/create-withdrawal";
import {
  formatWithdrawalAmount,
  parseWithdrawalAmountInput,
  parseWithdrawalBalance,
} from "../lib/format-withdrawal-amount";
import { WithdrawalAssetSelect } from "./withdrawal-asset-select";
import { WithdrawalInfoNotice } from "./withdrawal-info-notice";
import { WithdrawalWalletControl } from "./withdrawal-wallet-control";

interface WithdrawalSendPanelProperties {
  assets: AssetWithTrustline[];
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  totalAmount: number;
  canContinue: boolean;
  isSubmitting: boolean;
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
  const recipientGetsDisplay = `${formatWithdrawalAmount(totalAmount)} ${ticker}`.trim();
  const feeDisplay = `${formatWithdrawalAmount(NETWORK_FEE)} ${ticker}`.trim();
  const minAmountDisplay = `0.00 ${ticker}`.trim();

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
            data-invalid={exceedsBalance ? "true" : undefined}
          >
            <div className="send-money-amount-row__meta">
              <span>{translate("youSend")}</span>
            </div>
            <div className="send-money-amount-row__input">
              <input
                aria-label={translate("amount")}
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
              />
              <button
                type="button"
                className="send-money-max"
                onClick={onMaxAmount}
              >
                {translate("max")}
              </button>
            </div>
          </div>
          <div className="send-money-amount-row">
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

        {hasAmount ? (
          <div className="send-money-summary-row">
            <span>{translate("fee")}</span>
            <span className="send-money-summary-row__value">{feeDisplay}</span>
          </div>
        ) : null}

        <div className="send-money-summary-row">
          <span>{translate("minAmount")}</span>
          <span className="send-money-summary-row__value">{minAmountDisplay}</span>
        </div>

        {/* <WithdrawalInfoNotice /> */}
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
