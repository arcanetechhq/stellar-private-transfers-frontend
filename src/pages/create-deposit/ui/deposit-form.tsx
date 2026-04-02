import React from "react";
import { Info } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { AssetWithTrustline } from "@/entities/asset";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-deposit";

interface AssetSelectorProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpen: () => void;
}

function AssetSelector({ selectedToken, onOpen }: AssetSelectorProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold leading-[20px] text-[var(--foreground-primary)]">
        {translate("asset")}
      </label>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <TokenIcon
              ticker={selectedToken.assetId.toUpperCase()}
              logoUrl={selectedToken.logoUrl}
              size={40}
            />
            <div className="text-left">
              <p className="text-[14px] font-semibold leading-[20px] text-[var(--foreground-primary)]">
                {selectedToken.assetId.toUpperCase()}
              </p>
              <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
                {selectedToken.name}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-[var(--foreground-tertiary)]">
            {translate("asset")}
          </p>
        )}
        <ChevronDown className="h-4 w-4 text-[var(--foreground-secondary)]" />
      </button>
    </div>
  );
}

interface AmountInputProperties {
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
}

function AmountInput({ amount, onAmountChange, onMaxAmount, onPercentage }: AmountInputProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold leading-[20px] text-[var(--foreground-primary)]">
        {translate("amount")}
      </label>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-[var(--border)] px-4 py-4 pr-20 text-[20px] font-semibold text-[var(--foreground-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          type="button"
          onClick={onMaxAmount}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-[13px] font-semibold text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          {translate("max")}
        </button>
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
      </div>
    </div>
  );
}

function DepositInfoBanner() {
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#3B82F6" }} />
        <div>
          <p className="mb-1 font-semibold" style={{ fontSize: "14px", lineHeight: "20px", color: "#1E40AF" }}>
            {translate("aboutDeposits")}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#1E40AF" }}>
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
}

export function DepositForm({
  selectedToken,
  amount,
  onAmountChange,
  onMaxAmount,
  onPercentage,
  onOpenTokenPicker,
}: DepositFormProperties) {
  return (
    <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #E7EAF0" }}>
      <div className="space-y-6">
        <AssetSelector selectedToken={selectedToken} onOpen={onOpenTokenPicker} />
        <AmountInput
          amount={amount}
          onAmountChange={onAmountChange}
          onMaxAmount={onMaxAmount}
          onPercentage={onPercentage}
        />
        <DepositInfoBanner />
      </div>
    </div>
  );
}
