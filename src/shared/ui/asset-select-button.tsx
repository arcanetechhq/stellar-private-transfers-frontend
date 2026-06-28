import React from "react";
import { ChevronDown } from "lucide-react";
import { formatBalance } from "@/shared/lib/format-balance";
import { TokenIcon } from "@/shared/ui/token-icon";

type SelectableAsset = {
  assetId: string;
  name: string;
  logoUrl?: string;
  balance?: string;
};

type AssetSelectButtonProperties = {
  asset: SelectableAsset | undefined;
  label: string;
  placeholder: string;
  onOpen: () => void;
  tickerClassName?: string;
};

export function AssetSelectButton({
  asset,
  label,
  placeholder,
  onOpen,
  tickerClassName = "text-[15px] leading-[20px] font-semibold text-[var(--foreground-primary)]",
}: AssetSelectButtonProperties) {
  const assetBalance = React.useMemo(
    () => formatBalance(asset?.balance),
    [asset?.balance],
  );

  return (
    <div>
      <label className="mb-2 block text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
        {label}
      </label>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
      >
        {asset ? (
          <div className="flex items-center gap-3">
            <TokenIcon
              ticker={asset.assetId.toUpperCase()}
              logoUrl={asset.logoUrl}
              size={40}
            />
            <div className="text-left">
              <p className={tickerClassName}>{asset.assetId.toUpperCase()}</p>
              <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
                {asset.name}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[15px] text-[var(--foreground-tertiary)]">
            {placeholder}
          </p>
        )}
        <div className="flex items-center gap-3">
          {asset ? (
            <p className="text-right text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
              {assetBalance}
            </p>
          ) : undefined}
          <ChevronDown className="h-4 w-4 text-[var(--foreground-secondary)]" />
        </div>
      </button>
    </div>
  );
}
