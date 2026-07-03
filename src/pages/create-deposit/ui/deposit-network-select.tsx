import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDismissOnOutsideClick } from "@/shared/hooks";
import {
  DEPOSIT_NETWORK_OPTIONS,
  type DepositNetworkOption,
} from "../lib/deposit-mock-data";
import { DepositNetworkBadge } from "./deposit-network-badge";

interface DepositNetworkSelectProperties {
  selectedNetworkId: string;
  disabled?: boolean;
  options?: DepositNetworkOption[];
  onSelect: (networkId: string) => void;
}

export function DepositNetworkSelect({
  selectedNetworkId,
  disabled = false,
  options = DEPOSIT_NETWORK_OPTIONS,
  onSelect,
}: DepositNetworkSelectProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const menu = useDismissOnOutsideClick<HTMLDivElement>();
  const selectedNetwork =
    options.find((network) => network.id === selectedNetworkId) ?? options[0];
  const hasSingleOption = options.length === 1;

  function handleSelect(networkId: string) {
    onSelect(networkId);
    menu.close();
  }

  function handleButtonClick() {
    if (hasSingleOption) {
      return;
    }
    menu.toggle();
  }

  return (
    <div ref={menu.ref} className="deposit-network-select">
      <button
        type="button"
        className="deposit-network-select__button"
        data-open={menu.isOpen ? "true" : undefined}
        data-single-option={hasSingleOption ? "true" : undefined}
        aria-haspopup={hasSingleOption ? undefined : "menu"}
        aria-expanded={hasSingleOption ? undefined : menu.isOpen}
        aria-label={translate("selectNetwork")}
        disabled={disabled}
        onClick={handleButtonClick}
      >
        <span className="deposit-network-select__main">
          <DepositNetworkBadge network={selectedNetwork} />
          <span className="deposit-network-select__copy">
            <span className="deposit-network-select__code">
              {selectedNetwork.label}
            </span>
          </span>
        </span>
        {hasSingleOption ? null : (
          <span className="deposit-network-select__right">
            <ChevronDown size={18} strokeWidth={1.6} />
          </span>
        )}
      </button>
      {menu.isOpen && !hasSingleOption ? (
        <span
          className="deposit-network-menu"
          role="menu"
          aria-label={translate("selectNetwork")}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.id}
              className="deposit-network-option"
              data-active={option.id === selectedNetwork.id ? "true" : undefined}
              role="menuitemradio"
              aria-checked={option.id === selectedNetwork.id}
              onClick={() => handleSelect(option.id)}
            >
              <DepositNetworkBadge network={option} />
              <span className="deposit-network-option__label">
                {option.label}
              </span>
              {option.id === selectedNetwork.id ? (
                <Check size={16} strokeWidth={1.7} />
              ) : null}
            </button>
          ))}
        </span>
      ) : null}
    </div>
  );
}
