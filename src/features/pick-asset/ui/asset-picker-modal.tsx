import React, { useState } from "react";
import { Search, X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { AssetWithTrustline } from "@/entities/asset";

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

interface AssetListItemProperties {
  asset: AssetWithTrustline;
  isSelected: boolean;
  onSelect: (asset: AssetWithTrustline) => void;
}

function AssetListItem({ asset, isSelected, onSelect }: AssetListItemProperties) {
  const hasBalance =
    asset.balance !== undefined && Number.parseFloat(asset.balance) > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors ${
        isSelected
          ? "bg-[var(--surface-subtle)]"
          : "hover:bg-[var(--surface-hover)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <TokenIcon
          ticker={asset.assetId.toUpperCase()}
          logoUrl={asset.logoUrl}
          size={40}
        />
        <div className="text-left">
          <p className="text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            {asset.assetId.toUpperCase()}
          </p>
          <p className="text-[13px] leading-[18px] text-[var(--foreground-secondary)]">
            {asset.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {asset.trustlineStatus !== "loading" && (
          <p
            className={`text-right text-[14px] leading-[20px] font-semibold ${
              hasBalance
                ? "text-[var(--foreground-primary)]"
                : "text-[var(--foreground-tertiary)]"
            }`}
          >
            {formatBalance(asset.balance)}
          </p>
        )}
        {isSelected && <Check className="h-5 w-5 text-[var(--success)]" />}
      </div>
    </button>
  );
}

export interface AssetPickerModalProperties {
  assets: AssetWithTrustline[];
  selectedAssetId: string | undefined;
  onSelect: (asset: AssetWithTrustline) => void;
  onClose: () => void;
}

export function AssetPickerModal({
  assets,
  selectedAssetId,
  onSelect,
  onClose,
}: AssetPickerModalProperties) {
  const { t: translate } = useTranslation("assets");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = assets
    .filter(
      (asset) =>
        asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .toSorted((left, right) => left.id - right.id);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="m-4 flex w-full max-w-md flex-col rounded-2xl bg-[var(--card)] shadow-2xl"
        style={{ maxHeight: "80vh" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <h3 className="text-[18px] leading-[28px] font-semibold text-[var(--foreground-primary)]">
            {translate("picker.title")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--foreground-secondary)]" />
            <input
              type="text"
              placeholder={translate("picker.searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] py-2.5 pr-4 pl-10 text-[14px] text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] leading-[20px] text-[var(--foreground-secondary)]">
                {translate("picker.noResults")}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAssets.map((asset) => (
                <AssetListItem
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssetId === asset.assetId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
