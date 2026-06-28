import React from "react";
import { useTranslation } from "react-i18next";
import { AmountInputPanel } from "@/shared/ui/amount-input-panel";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-transfer";

interface AmountFieldProperties {
  amount: string;
  availableBalance: string | undefined;
  onAmountChange: (value: string) => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

export function AmountField({
  amount,
  availableBalance,
  onAmountChange,
  onPercentage,
  onMaxAmount,
}: AmountFieldProperties) {
  const { t: translate } = useTranslation("transfer");

  return (
    <AmountInputPanel
      label={translate("amount")}
      amount={amount}
      availableBalance={availableBalance}
      availableLabel={(balance) => translate("availableForMax", { amount: balance })}
      maxLabel={translate("max")}
      onAmountChange={onAmountChange}
      onMaxAmount={onMaxAmount}
      placeholder={translate("amountPlaceholder")}
      inputClassName="w-full rounded-lg border border-[var(--border)] px-4 py-4 pr-28 text-[20px] font-semibold text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
      quickPercentages={QUICK_PERCENTAGE_OPTIONS}
      quickMaxLabel={translate("maxButton")}
      onPercentage={onPercentage}
    />
  );
}
