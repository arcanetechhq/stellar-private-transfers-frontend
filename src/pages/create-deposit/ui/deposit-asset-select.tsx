import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDismissOnOutsideClick } from "@/shared/hooks";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatDepositBalance } from "../lib/format-deposit-balance";
import { DepositAssetBadge } from "./deposit-asset-badge";

interface DepositAssetSelectProperties {
  assets: AssetWithTrustline[];
  selectedAsset: AssetWithTrustline | undefined;
  disabled?: boolean;
  onSelect: (asset: AssetWithTrustline) => void;
}

export function DepositAssetSelect({
  assets,
  selectedAsset,
  disabled = false,
  onSelect,
}: DepositAssetSelectProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const menu = useDismissOnOutsideClick<HTMLDivElement>();

  function handleSelect(asset: AssetWithTrustline) {
    onSelect(asset);
    menu.close();
  }

  return (
    <div ref={menu.ref} className="deposit-asset-select">
      <button
        type="button"
        className="deposit-asset-select__button"
        data-open={menu.isOpen ? "true" : undefined}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        aria-label={translate("selectAsset")}
        disabled={disabled || !selectedAsset}
        onClick={menu.toggle}
      >
        {selectedAsset ? (
          <>
            <span className="deposit-asset-select__main">
              <DepositAssetBadge asset={selectedAsset} />
              <span className="deposit-asset-select__copy">
                <span className="deposit-asset-select__code">
                  {selectedAsset.assetId.toUpperCase()}
                </span>
                <span className="deposit-asset-select__label">
                  {selectedAsset.name}
                </span>
              </span>
            </span>
            <span className="deposit-asset-select__right">
              <ChevronDown size={18} strokeWidth={1.6} />
            </span>
          </>
        ) : (
          <span className="deposit-asset-select__copy">
            <span className="deposit-asset-select__code">
              {translate("selectAsset")}
            </span>
          </span>
        )}
      </button>
      {menu.isOpen ? (
        <span className="deposit-asset-menu" role="menu" aria-label={translate("selectAsset")}>
          {assets.map((option) => (
            <button
              type="button"
              key={option.assetId}
              className="deposit-asset-option"
              data-active={option.assetId === selectedAsset?.assetId ? "true" : undefined}
              role="menuitemradio"
              aria-checked={option.assetId === selectedAsset?.assetId}
              onClick={() => handleSelect(option)}
            >
              <DepositAssetBadge asset={option} />
              <span className="deposit-asset-option__text">
                <span>{option.assetId.toUpperCase()}</span>
                <span>{option.name}</span>
              </span>
              <span className="deposit-asset-option__balance">
                {formatDepositBalance(option.balance)}
              </span>
              {option.assetId === selectedAsset?.assetId ? (
                <Check size={16} strokeWidth={1.7} />
              ) : null}
            </button>
          ))}
        </span>
      ) : null}
    </div>
  );
}
