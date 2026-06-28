import React from "react";
import { useTranslation } from "react-i18next";
import { AmountInputPanel } from "@/shared/ui/amount-input-panel";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-withdrawal";

interface AmountInputProperties {
  amount: string;
  availableBalance: string | undefined;
  onAmountChange: (value: string) => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

export function AmountInput(properties: AmountInputProperties) {
  const { amount, availableBalance, onAmountChange, onPercentage, onMaxAmount } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <AmountInputPanel
      inputClassName="w-full rounded-lg border border-[var(--border-input)] bg-[var(--input-background)] px-4 py-4 pr-28 text-xl font-semibold text-[var(--foreground-primary)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
      placeholder={translate("amountPlaceholder")}
      maxLabel={translate("max")}
      availableLabel={(balance) => translate("availableForMax", { amount: balance })}
      availableBalance={availableBalance}
      amount={amount}
      label={translate("amount")}
      onPercentage={onPercentage}
      onMaxAmount={onMaxAmount}
      onAmountChange={onAmountChange}
      quickMaxLabel={translate("maxButton")}
      quickPercentages={QUICK_PERCENTAGE_OPTIONS}
    />
  );
}
