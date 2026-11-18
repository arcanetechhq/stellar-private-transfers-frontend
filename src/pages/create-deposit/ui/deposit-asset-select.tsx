import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDismissOnOutsideClick } from "@/shared/hooks";
import { isNativeCatalogXlm, type AssetWithTrustline } from "@/entities/asset";
import { formatDepositBalance } from "../lib/format-deposit-balance";
import { DepositAssetBadge } from "./deposit-asset-badge";

interface DepositAssetSelectProperties {
  assets: AssetWithTrustline[];
  selectedAsset: AssetWithTrustline | undefined;
  disabled?: boolean;
  onSelect: (asset: AssetWithTrustline) => void;
}

function DepositAssetOption({
  option,
  selected,
  onSelect,
}: {
  option: AssetWithTrustline;
  selected: boolean;
  onSelect: (asset: AssetWithTrustline) => void;
}) {
  const balance = formatDepositBalance(option.balance);
  return (
    <button
      type="button"
      className="deposit-asset-option"
      data-testid="deposit-asset-option"
      data-asset={option.assetId.toUpperCase()}
      data-active={selected ? "true" : undefined}
      role="menuitemradio"
      aria-checked={selected}
      onClick={() => onSelect(option)}
    >
      <DepositAssetBadge asset={option} />
      <span className="deposit-asset-option__text">
        <span>{option.assetId.toUpperCase()}</span>
        <span>{option.name}</span>
      </span>
      <span
        className="deposit-asset-option__balance"
        data-network-fee-balance={
          isNativeCatalogXlm(option) ? balance : undefined
        }
      >
        {balance}
      </span>
      {selected ? <Check size={16} strokeWidth={1.7} /> : undefined}
    </button>
  );
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
        data-testid="deposit-asset-select"
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
            <DepositAssetOption
              key={option.assetId}
              option={option}
              selected={option.assetId === selectedAsset?.assetId}
              onSelect={handleSelect}
            />
          ))}
        </span>
      ) : undefined}
    </div>
  );
}
