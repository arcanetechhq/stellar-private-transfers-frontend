import { Info, Loader2 } from "lucide-react";
import React from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import type { RecipientRegistryStatus } from "../model/use-recipient-registry-status";
import { formatTransferAmount } from "../lib/format-transfer-amount";
import { formatTransferBalanceWithTicker, parseTransferBalance } from "../lib/format-transfer-balance";
import { TransferAssetSelect } from "./transfer-asset-select";
import { TransferRecipientControl } from "./transfer-recipient-control";

interface TransferSendPanelProperties {
  assets: AssetWithTrustline[];
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  recipientErrorKey: "invalidRecipient" | "sameAsSender" | undefined;
  recipientRegistryStatus: RecipientRegistryStatus;
  totalAmount: number;
  canContinue: boolean;
  isSubmitting: boolean;
  excludeStellarAddress?: string;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onTokenSelect: (asset: AssetWithTrustline) => void;
  onMaxAmount: () => void;
  onContinue: () => void;
}

function recipientErrorMessageFromKey(
  recipientErrorKey: TransferSendPanelProperties["recipientErrorKey"],
  translate: TFunction<"transfer", undefined>,
): string | undefined {
  if (recipientErrorKey === "invalidRecipient") {
    return translate("invalidRecipientStellarAddress");
  }
  if (recipientErrorKey === "sameAsSender") {
    return translate("recipientSameAsSender");
  }
  return undefined;
}

function PrivateTransferNotice() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="transfer-privacy-notice transfer-privacy-notice--info">
      <Info className="transfer-privacy-notice__icon" aria-hidden="true" />
      <div>
        <p className="transfer-privacy-notice__title">
          {translate("privateTransferNotice")}
        </p>
        <p className="transfer-privacy-notice__text">
          {translate("privateTransferDescription")}
        </p>
      </div>
    </div>
  );
}

function OnboardingRecipientNotice() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="transfer-privacy-notice transfer-privacy-notice--warning">
      <Info className="transfer-privacy-notice__icon" aria-hidden="true" />
      <div>
        <p className="transfer-privacy-notice__title">
          {translate("onboardingRecipientNotice")}
        </p>
        <p className="transfer-privacy-notice__text">
          {translate("onboardingRecipientDescription")}
        </p>
      </div>
    </div>
  );
}

function TransferPrivacyNotice({
  recipientRegistryStatus,
}: {
  recipientRegistryStatus: RecipientRegistryStatus;
}) {
  if (recipientRegistryStatus === "unregistered") {
    return <OnboardingRecipientNotice />;
  }
  // return <PrivateTransferNotice />;
}

export function TransferSendPanel({
  assets,
  selectedToken,
  amount,
  recipient,
  recipientErrorKey,
  recipientRegistryStatus,
  totalAmount,
  canContinue,
  isSubmitting,
  excludeStellarAddress,
  onAmountChange,
  onRecipientChange,
  onTokenSelect,
  onMaxAmount,
  onContinue,
}: TransferSendPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("transfer");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "";
  const recipientErrorMessage = recipientErrorMessageFromKey(
    recipientErrorKey,
    translate,
  );
  const numericAmount = Number.parseFloat(amount);
  const numericBalance = parseTransferBalance(selectedToken?.balance);
  const hasAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const exceedsBalance =
    hasAmount &&
    Number.isFinite(numericBalance) &&
    numericAmount > numericBalance;
  const recipientGetsDisplay = `${formatTransferAmount(totalAmount)} ${ticker}`.trim();
  const feeDisplay = `0 ${ticker}`.trim();
  const availableBalanceDisplay = formatTransferBalanceWithTicker(
    selectedToken?.balance,
    ticker,
  );

  return (
    <div className="transfer-send-panel">
      <div className="send-money-card">
        <TransferRecipientControl
          recipient={recipient}
          onRecipientChange={onRecipientChange}
          excludeStellarAddress={excludeStellarAddress}
          errorMessage={recipientErrorMessage}
        />
        <TransferAssetSelect
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
              <span>
                {translate("availableBalance", {
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

        {hasAmount ? (
          <div className="send-money-summary-row">
            <span>{translate("fee")}</span>
            <span className="send-money-summary-row__value">{feeDisplay}</span>
          </div>
        ) : null}

        <TransferPrivacyNotice recipientRegistryStatus={recipientRegistryStatus} />
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
