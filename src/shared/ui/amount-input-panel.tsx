import React from "react";
import { formatBalance } from "@/shared/lib/format-balance";

type AmountInputPanelProperties = {
  label: string;
  amount: string;
  availableBalance: string | undefined;
  availableLabel: (amount: string) => string;
  maxLabel: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  placeholder: string;
  inputClassName: string;
  quickPercentages?: number[];
  quickMaxLabel?: string;
  onPercentage?: (percentage: number) => void;
};

export function AmountInputPanel({
  label,
  amount,
  availableBalance,
  availableLabel,
  maxLabel,
  onAmountChange,
  onMaxAmount,
  placeholder,
  inputClassName,
  quickPercentages = [],
  quickMaxLabel,
  onPercentage,
}: AmountInputPanelProperties) {
  const maxAvailableBalance = React.useMemo(
    () => formatBalance(availableBalance),
    [availableBalance],
  );

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col items-end">
          {maxAvailableBalance === "—" ? undefined : (
            <p className="mb-1 text-[12px] leading-[16px] text-[var(--foreground-secondary)]">
              {availableLabel(maxAvailableBalance)}
            </p>
          )}
          <button
            type="button"
            onClick={onMaxAmount}
            className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-[13px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            {maxLabel}
          </button>
        </div>
      </div>
      {quickPercentages.length > 0 && onPercentage ? (
        <div className="mt-3 flex gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              type="button"
              onClick={() => onPercentage(percentage)}
              className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[13px] font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              {percentage}%
            </button>
          ))}
          {quickMaxLabel ? (
            <button
              type="button"
              onClick={onMaxAmount}
              className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-[13px] font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              {quickMaxLabel}
            </button>
          ) : undefined}
        </div>
      ) : undefined}
    </div>
  );
}
