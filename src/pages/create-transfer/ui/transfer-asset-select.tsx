import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDismissOnOutsideClick } from "@/shared/hooks";
import type { AssetWithTrustline } from "@/entities/asset";
import { formatTransferBalanceWithTicker } from "../lib/format-transfer-balance";
import { TransferAssetBadge } from "./transfer-asset-badge";

interface TransferAssetSelectProperties {
  assets: AssetWithTrustline[];
  selectedAsset: AssetWithTrustline | undefined;
  onSelect: (asset: AssetWithTrustline) => void;
}

export function TransferAssetSelect({
  assets,
  selectedAsset,
  onSelect,
}: TransferAssetSelectProperties): React.JSX.Element {
  const { t: translate } = useTranslation("transfer");
  const menu = useDismissOnOutsideClick<HTMLDivElement>();

  function handleSelect(asset: AssetWithTrustline) {
    onSelect(asset);
    menu.close();
  }

  return (
    <div ref={menu.ref} className="send-money-asset-select">
      <button
        type="button"
        className="send-money-asset-select__button"
        data-open={menu.isOpen ? "true" : undefined}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        aria-label={translate("selectAsset")}
        disabled={!selectedAsset}
        onClick={menu.toggle}
      >
        {selectedAsset ? (
          <>
            <span className="send-money-asset-select__main">
              <TransferAssetBadge asset={selectedAsset} />
              <span className="send-money-asset-select__copy">
                <span className="send-money-asset-select__code">
                  {selectedAsset.assetId.toUpperCase()}
                </span>
                <span className="send-money-asset-select__label">
                  {selectedAsset.name}
                </span>
              </span>
            </span>
            <span className="send-money-asset-select__right">
              <span>
                {translate("availableBalance", {
                  amount: formatTransferBalanceWithTicker(
                    selectedAsset.balance,
                    selectedAsset.assetId,
                  ),
                })}
              </span>
              <ChevronDown size={18} strokeWidth={1.6} />
            </span>
          </>
        ) : (
          <span className="send-money-asset-select__copy">
            <span className="send-money-asset-select__code">
              {translate("selectAsset")}
            </span>
          </span>
        )}
      </button>
      {menu.isOpen ? (
        <span className="send-money-asset-menu" role="menu" aria-label={translate("selectAsset")}>
          {assets.map((option) => (
            <button
              type="button"
              key={option.assetId}
              className="send-money-asset-option"
              data-active={
                option.assetId === selectedAsset?.assetId ? "true" : undefined
              }
              role="menuitemradio"
              aria-checked={option.assetId === selectedAsset?.assetId}
              onClick={() => handleSelect(option)}
            >
              <TransferAssetBadge asset={option} />
              <span className="send-money-asset-option__text">
                <span>{option.assetId.toUpperCase()}</span>
                <span>{option.name}</span>
              </span>
              <span className="send-money-asset-option__balance">
                {formatTransferBalanceWithTicker(
                  option.balance,
                  option.assetId,
                )}
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
