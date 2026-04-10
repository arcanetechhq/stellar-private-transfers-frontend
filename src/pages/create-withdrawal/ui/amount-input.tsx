import React from "react";
import { useTranslation } from "react-i18next";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-withdrawal";

function formatBalance(raw: string | undefined): string {
  if (raw === undefined) return "—";
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return raw;
  if (value === 0) return "0";
  if (value < 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
  const maxAvailableBalance = React.useMemo(
    () => formatBalance(availableBalance),
    [availableBalance],
  );

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-5 font-semibold text-[var(--foreground-primary)]">
        {translate("amount")}
      </label>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={translate("amountPlaceholder")}
          className="w-full rounded-lg border border-[var(--border-input)] bg-[var(--input-background)] px-4 py-4 pr-28 text-xl font-semibold text-[var(--foreground-primary)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        />
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col items-end">
          {maxAvailableBalance === "—" ? undefined : (
            <p className="mb-1 text-[12px] leading-[16px] text-[var(--foreground-secondary)]">
              {translate("availableForMax", { amount: maxAvailableBalance })}
            </p>
          )}
          <button
            type="button"
            onClick={onMaxAmount}
            className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-[13px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            {translate("max")}
          </button>
        </div>
      </div>
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
    </div>
  );
}
