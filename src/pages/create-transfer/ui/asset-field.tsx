import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { AssetWithTrustline } from "@/entities/asset";

interface AssetFieldProperties {
  selectedToken: AssetWithTrustline | undefined;
  onOpenTokenPicker: () => void;
}

export function AssetField({ selectedToken, onOpenTokenPicker }: AssetFieldProperties) {
  const { t: translate } = useTranslation("transfer");

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
        <ChevronDown className="h-4 w-4 text-[var(--foreground-secondary)]" />
      </button>
    </div>
  );
}
