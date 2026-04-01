import React from "react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Token } from "../model/create-withdrawal";

interface AssetSelectorProperties {
  selectedToken: Token;
  onOpenPicker: () => void;
}

export function AssetSelector(properties: AssetSelectorProperties) {
  const { selectedToken, onOpenPicker } = properties;
  const { t: translate } = useTranslation("withdrawal");
  const fiatBalance = (selectedToken.balance * selectedToken.price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <label
        className="mb-2 block"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#344054", fontWeight: 600 }}
      >
        {translate("asset")}
      </label>
      <button
        type="button"
        onClick={onOpenPicker}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors"
        style={{ border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
        onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F9FAFB")}
        onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
      >
        <div className="flex items-center gap-3">
          <TokenIcon ticker={selectedToken.ticker} size={40} />
          <div className="text-left">
            <p
              className="font-semibold"
              style={{ fontSize: "15px", lineHeight: "20px", color: "#121826" }}
            >
              {selectedToken.ticker}
            </p>
            <p style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
              {selectedToken.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="font-semibold"
            style={{ fontSize: "15px", lineHeight: "20px", color: "#121826" }}
          >
            {selectedToken.balance.toLocaleString()}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
            ${fiatBalance}
          </p>
        </div>
      </button>
    </div>
  );
}
