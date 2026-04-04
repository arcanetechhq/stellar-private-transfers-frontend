import React from "react";
import { useTranslation } from "react-i18next";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-transfer";

interface QuickAmountButtonsProperties {
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

function QuickAmountButtons({ onPercentage, onMaxAmount }: QuickAmountButtonsProperties) {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="mt-3 flex gap-2">
      {QUICK_PERCENTAGE_OPTIONS.map((percentage) => (
        <button
          key={percentage}
          type="button"
          onClick={() => onPercentage(percentage)}
          className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[13px] font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          {percentage}%
        </button>
      ))}
      <button
        type="button"
        onClick={onMaxAmount}
        className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[13px] font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
      >
        {translate("maxButton")}
      </button>
    </div>
  );
}

interface AmountFieldProperties {
  amount: string;
  onAmountChange: (value: string) => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

export function AmountField({ amount, onAmountChange, onPercentage, onMaxAmount }: AmountFieldProperties) {
  const { t: translate } = useTranslation("transfer");
  return (
    <div>
      <label className="mb-2 block text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
        {translate("amount")}
      </label>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={translate("amountPlaceholder")}
          className="w-full rounded-lg border border-[var(--border)] px-4 py-4 pr-20 text-[20px] font-semibold text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        />
        <button
          type="button"
          onClick={onMaxAmount}
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-[13px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          {translate("max")}
        </button>
      </div>
      <QuickAmountButtons onPercentage={onPercentage} onMaxAmount={onMaxAmount} />
    </div>
  );
}
