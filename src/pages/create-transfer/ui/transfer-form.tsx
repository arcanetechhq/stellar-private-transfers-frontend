import { Users, Info } from "lucide-react";
import React from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { AssetWithTrustline } from "@/entities/asset";
import { AssetField } from "./asset-field";
import { AmountField } from "./amount-field";

interface RecipientFieldProperties {
  recipient: string;
  onRecipientChange: (value: string) => void;
  onOpenContactPicker: () => void;
  errorMessage: string | undefined;
}

function RecipientField(properties: RecipientFieldProperties) {
  const { recipient, onRecipientChange, onOpenContactPicker, errorMessage } =
    properties;
  const { t: translate } = useTranslation("transfer");
  return (
    <div>
      <label
        htmlFor="transfer-recipient"
        className="mb-2 block text-sm leading-5 font-semibold text-[var(--foreground-primary)]"
      >
        {translate("recipientAddress")}
      </label>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <input
            id="transfer-recipient"
            type="text"
            value={recipient}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder={translate("recipientPlaceholder")}
            className="w-full rounded-lg border border-[var(--border-input)] bg-[var(--input-background)] px-4 py-3 font-mono text-sm text-[var(--foreground-primary)] transition-colors placeholder:text-[var(--foreground-tertiary)] hover:bg-[var(--input-background-hover)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={
              errorMessage ? "transfer-recipient-error" : undefined
            }
          />
        </div>
        <button
          type="button"
          onClick={onOpenContactPicker}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border-input)] bg-[var(--secondary)] px-4 py-3 text-[13px] leading-[18px] whitespace-nowrap text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          <Users className="h-4 w-4" />
          {translate("selectFromContacts")}
        </button>
      </div>

      {errorMessage ? (
        <p
          id="transfer-recipient-error"
          className="mt-1.5 text-xs text-[var(--error)]"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : undefined}
    </div>
  );
}

function PrivacyNotice() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--info)]" />
        <div>
          <p className="mb-1 text-sm leading-5 font-semibold text-[var(--info-foreground)]">
            {translate("privateTransferNotice")}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--info-foreground)]">
            {translate("privateTransferDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface TransferFormProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  onAmountChange: (value: string) => void;
  recipient: string;
  onRecipientChange: (value: string) => void;
  recipientErrorKey: "invalidRecipient" | "sameAsSender" | undefined;
  onOpenTokenPicker: () => void;
  onOpenContactPicker: () => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

function recipientErrorMessageFromKey(
  recipientErrorKey: TransferFormProperties["recipientErrorKey"],
  translate: TFunction<"transfer", undefined>,
): string | undefined {
  if (recipientErrorKey === "invalidRecipient") {
    return translate("invalidRecipientPrivateAddress");
  }
  if (recipientErrorKey === "sameAsSender") {
    return translate("recipientSameAsSender");
  }
  return undefined;
}

export function TransferForm(properties: TransferFormProperties) {
  const {
    selectedToken,
    amount,
    onAmountChange,
    recipient,
    onRecipientChange,
    recipientErrorKey,
    onOpenTokenPicker,
    onOpenContactPicker,
    onPercentage,
    onMaxAmount,
  } = properties;
  const { t: translate } = useTranslation("transfer");
  const recipientErrorMessage = recipientErrorMessageFromKey(
    recipientErrorKey,
    translate,
  );
  return (
    <div className="col-span-2">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-6">
          <AssetField
            selectedToken={selectedToken}
            onOpenTokenPicker={onOpenTokenPicker}
          />
          <AmountField
            amount={amount}
            availableBalance={selectedToken?.balance}
            onAmountChange={onAmountChange}
            onPercentage={onPercentage}
            onMaxAmount={onMaxAmount}
          />
          <RecipientField
            recipient={recipient}
            onRecipientChange={onRecipientChange}
            onOpenContactPicker={onOpenContactPicker}
            errorMessage={recipientErrorMessage}
          />
          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
}
