import React from "react";
import { useTranslation } from "react-i18next";
import {
  DEPOSIT_MODE_OPTIONS,
  type DepositMode,
} from "../lib/deposit-mode";

interface DepositModeSwitchProperties {
  mode: DepositMode;
  onModeChange: (mode: DepositMode) => void;
}

export function DepositModeSwitch({
  mode,
  onModeChange,
}: DepositModeSwitchProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="deposit-mode-switch" role="tablist" aria-label={translate("modeSwitchLabel")}>
      {DEPOSIT_MODE_OPTIONS.map((option) => (
        <button
          type="button"
          key={option.id}
          role="tab"
          aria-selected={mode === option.id}
          data-active={mode === option.id ? "true" : undefined}
          onClick={() => onModeChange(option.id)}
        >
          {translate(option.labelKey)}
        </button>
      ))}
    </div>
  );
}
