import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatDepositBalance } from "../lib/format-deposit-balance";
import { formatDepositSpendableBalanceInput } from "../lib/compute-deposit-spendable-balance";
import { DepositWalletControl } from "./deposit-wallet-control";
import { useRequiredFeeDisplay } from "@/shared/lib/protocol-fee/use-required-fee-display.js";

interface DepositWalletPanelProperties {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
}

export function DepositWalletPanel({
  selectedAsset,
  amount,
  canSubmit,
  isSubmitting,
  errorMessage,
  onAmountChange,
  onMaxAmount,
}: DepositWalletPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const walletConnected = Boolean(publicKey);
  const ticker = selectedAsset?.assetId.toUpperCase() ?? "";
  const spendableBalanceInput = formatDepositSpendableBalanceInput(
    selectedAsset,
    selectedAsset?.balance,
  );
  const availableBalance = formatDepositBalance(spendableBalanceInput);
  const numericAmount = Number.parseFloat(amount);
  const hasAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const feeDisplay = useRequiredFeeDisplay({
    kind: "deposit",
    amount,
    feeAsset: selectedAsset?.clientContract,
    decimals: selectedAsset?.decimals,
    ticker,
  });

  return (
    <div className="private-deposit-panel">
      <div className="send-money-card">
        <DepositWalletControl />

        <div
          className="send-money-amount-panel"
          data-invalid={errorMessage ? "true" : undefined}
        >
          <div
            className="send-money-amount-row"
            data-invalid={errorMessage ? "true" : undefined}
          >
            <div className="send-money-amount-row__meta">
              <span>{translate("depositAmount")}</span>
              {walletConnected ? (
                <span>
                  {translate("availableBalance", { amount: availableBalance })}
                </span>
              ) : null}
            </div>
            <div className="send-money-amount-row__input">
              <input
                aria-label={translate("amount")}
                data-testid="deposit-amount"
                inputMode="decimal"
                value={amount}
                placeholder="0"
                onChange={(event) => onAmountChange(event.target.value)}
              />
              <span className="send-money-amount-code">{ticker}</span>
              <button
                type="button"
                className="send-money-max"
                disabled={!walletConnected || spendableBalanceInput === "0"}
                onClick={onMaxAmount}
              >
                {translate("max")}
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="private-deposit-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {hasAmount ? (
          <div className="send-money-summary-row">
            <span>{translate("fee")}</span>
            <span className="send-money-summary-row__value" data-testid="required-fee">
              {feeDisplay}
            </span>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        data-testid="deposit-confirm"
        className="send-money-continue"
        disabled={!canSubmit}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {translate("continue")}
      </button>
    </div>
  );
}
