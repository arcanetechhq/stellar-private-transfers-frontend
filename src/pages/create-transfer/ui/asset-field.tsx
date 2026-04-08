import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { AssetWithTrustline } from "@/entities/asset";

interface AssetFieldProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpenTokenPicker: () => void;
}

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

export function AssetField({ selectedToken, onOpenTokenPicker }: AssetFieldProperties) {
  const { t: translate } = useTranslation("transfer");
  const selectedTokenBalance = React.useMemo(
    () => formatBalance(selectedToken?.balance),
    [selectedToken?.balance],
  );

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
        {translate("asset")}
      </label>
      <button
        type="button"
        onClick={onOpenTokenPicker}
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
              <p className="text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
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
        <div className="flex items-center gap-3">
          {selectedToken ? (
            <p className="text-right text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
              {selectedTokenBalance}
            </p>
          ) : undefined}
          <ChevronDown className="h-4 w-4 text-[var(--foreground-secondary)]" />
        </div>
      </button>
    </div>
  );
}
