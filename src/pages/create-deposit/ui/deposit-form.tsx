import React from "react";
import { Info } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import { FormErrorAlert } from "@/shared/ui/form-error-alert";
import type { AssetWithTrustline } from "@/entities/asset";
import { StealthAddressPicker } from "@/features/pick-stealth-address";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-deposit";
import { useAppSelector } from "@/app/hooks";
import { selectAllStealthNonces } from "@/entities/stealth-address";
import { ManageStealthAddressesWidget } from "@/widgets/manage-stealth-addresses";

interface AssetSelectorProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpen: () => void;
}

function AssetSelector({ selectedToken, onOpen }: AssetSelectorProperties) {
  const { t: translate } = useTranslation("deposit");

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
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
              <p className="text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
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

function AmountInput({
  amount,
  onAmountChange,
  onMaxAmount,
  onPercentage,
}: AmountInputProperties) {
  const { t: translate } = useTranslation("deposit");

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
          placeholder="0.00"
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
  selectedStealthNonce: string | undefined;
  onStealthSelect: (nonce: string, stealthAddress: string) => void;
  errorMessage?: string;
}

export function DepositForm({
  selectedToken,
  amount,
  onAmountChange,
  onMaxAmount,
  onPercentage,
  onOpenTokenPicker,
  selectedStealthNonce,
  onStealthSelect,
  errorMessage,
}: DepositFormProperties) {
  const { t: translate } = useTranslation("deposit");
  const stealthNonces = useAppSelector(selectAllStealthNonces);
  const hasStealthNonces = stealthNonces.length > 0;

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
          onAmountChange={onAmountChange}
          onMaxAmount={onMaxAmount}
          onPercentage={onPercentage}
        />
        {hasStealthNonces ? (
          <StealthAddressPicker
            selectedNonce={selectedStealthNonce}
            onSelectNonce={onStealthSelect}
          />
        ) : (
          <ManageStealthAddressesWidget variant="compact" />
        )}
        <DepositInfoBanner />
      </div>
    </div>
  );
}
