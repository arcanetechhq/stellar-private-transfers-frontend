import React from "react";
import { Loader2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatDepositBalance } from "../lib/format-deposit-balance";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-deposit";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface DepositWalletPanelProperties {
  selectedAsset: AssetWithTrustline | undefined;
  amount: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
}

export function DepositWalletPanel({
  selectedAsset,
  amount,
  canSubmit,
  isSubmitting,
  errorMessage,
  onAmountChange,
  onMaxAmount,
  onPercentage,
}: DepositWalletPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { openPicker } = useStellarWalletModal();
  const walletConnected = Boolean(publicKey);
  const ticker = selectedAsset?.assetId.toUpperCase() ?? "";
  const availableBalance = formatDepositBalance(selectedAsset?.balance);

  function handleConnectWallet() {
    openPicker(walletConnected);
  }

  return (
    <div className="private-deposit-panel">
      <div className="private-deposit-card">
        <div className="private-deposit-route-card">
          <div className="private-deposit-route-item">
            <span className="private-deposit-route-icon" aria-hidden="true">
              <Wallet size={21} strokeWidth={1.8} />
            </span>
            <span className="private-deposit-route-copy">
              <span>
                {walletConnected
                  ? translate("connectedWallet")
                  : translate("connectWallet")}
              </span>
              <span>
                {walletConnected
                  ? shortenStellarAddress(publicKey ?? "", 4, 3)
                  : translate("connectWalletPrompt")}
              </span>
            </span>
            <button
              type="button"
              className="private-deposit-wallet-button"
              data-connected={walletConnected ? "true" : undefined}
              onClick={handleConnectWallet}
            >
              {walletConnected ? translate("changeWallet") : translate("connect")}
            </button>
          </div>
        </div>

        <div
          className="private-deposit-amount-card"
          data-invalid={errorMessage ? "true" : undefined}
        >
          <div className="private-deposit-amount-header">
            <span>{translate("youDeposit")}</span>
            {walletConnected ? (
              <span>
                {translate("availableBalance", { amount: availableBalance })}
              </span>
            ) : null}
          </div>
          <div className="private-deposit-amount-row">
            <input
              aria-label={translate("amount")}
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onChange={(event) => onAmountChange(event.target.value)}
            />
            <span className="private-deposit-amount-code">{ticker}</span>
            <div className="private-deposit-amount-actions">
              {/* {QUICK_PERCENTAGE_OPTIONS.map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  className="private-deposit-percent-button"
                  disabled={!walletConnected}
                  onClick={() => onPercentage(percentage)}
                >
                  {percentage}%
                </button>
              ))} */}
              <button
                type="button"
                className="private-deposit-max-button"
                disabled={!walletConnected}
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

        <div className="private-deposit-summary-row">
          <span>{translate("fee")}</span>
          <span className="send-money-fee-pill">{translate("feeFree")}</span>
        </div>
      </div>

      <button
        type="submit"
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
