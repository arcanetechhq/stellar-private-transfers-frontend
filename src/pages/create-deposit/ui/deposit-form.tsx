import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AmountInputPanel } from "@/shared/ui/amount-input-panel";
import { AssetSelectButton } from "@/shared/ui/asset-select-button";
import { FormErrorAlert } from "@/shared/ui/form-error-alert";
import type { AssetWithTrustline } from "@/entities/asset";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-deposit";

interface AssetSelectorProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpen: () => void;
}

function AssetSelector({ selectedToken, onOpen }: AssetSelectorProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <AssetSelectButton
      asset={selectedToken}
      label={translate("asset")}
      placeholder={translate("asset")}
      onOpen={onOpen}
      tickerClassName="text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]"
    />
  );
}

interface AmountInputProperties {
  amount: string;
  availableBalance: string | undefined;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
}

function AmountInput({
  amount,
  availableBalance,
  onAmountChange,
  onMaxAmount,
  onPercentage,
}: AmountInputProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <AmountInputPanel
      label={translate("amount")}
      amount={amount}
      availableBalance={availableBalance}
      availableLabel={(balance) => translate("availableForMax", { amount: balance })}
      maxLabel={translate("max")}
      onAmountChange={onAmountChange}
      onMaxAmount={onMaxAmount}
      placeholder="0.00"
      inputClassName="w-full rounded-lg border border-[var(--border)] px-4 py-4 pr-28 text-[20px] font-semibold text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
      quickPercentages={QUICK_PERCENTAGE_OPTIONS}
      onPercentage={onPercentage}
    />
  );
}

function DepositInfoBanner() {
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--info-bg)] p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--info)]" />
        <div>
          <p className="mb-1 text-sm leading-5 font-semibold text-[var(--info-foreground)]">
            {translate("aboutDeposits")}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--info-foreground)]">
            {translate("aboutDepositsText")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface DepositFormProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
  onOpenTokenPicker: () => void;
  errorMessage?: string;
}

export function DepositForm({
  selectedToken,
  amount,
  onAmountChange,
  onMaxAmount,
  onPercentage,
  onOpenTokenPicker,
  errorMessage,
}: DepositFormProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="space-y-6">
        <FormErrorAlert
          message={errorMessage}
          title={translate("submitErrorTitle")}
        />
        <AssetSelector
          selectedToken={selectedToken}
          onOpen={onOpenTokenPicker}
        />
        <AmountInput
          amount={amount}
          availableBalance={selectedToken?.balance}
          onAmountChange={onAmountChange}
          onMaxAmount={onMaxAmount}
          onPercentage={onPercentage}
        />
        <DepositInfoBanner />
      </div>
    </div>
  );
}
