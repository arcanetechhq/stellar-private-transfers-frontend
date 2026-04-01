import React from "react";
import { useTranslation } from "react-i18next";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-withdrawal";

interface AmountInputProperties {
  amount: string;
  onAmountChange: (value: string) => void;
  onPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
}

export function AmountInput(properties: AmountInputProperties) {
  const { amount, onAmountChange, onPercentage, onMaxAmount } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div>
      <label
        className="mb-2 block"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#344054", fontWeight: 600 }}
      >
        {translate("amount")}
      </label>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={translate("amountPlaceholder")}
          className="w-full rounded-lg px-4 py-4 pr-20 focus:ring-2 focus:outline-none"
          style={{ border: "1px solid #E7EAF0", fontSize: "20px", fontWeight: 600, color: "#121826" }}
        />
        <button
          type="button"
          onClick={onMaxAmount}
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg px-3 py-1.5 transition-colors"
          style={{ fontSize: "13px", fontWeight: 600, color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
          onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F6F7F9")}
          onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
        >
          {translate("max")}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {QUICK_PERCENTAGE_OPTIONS.map((percentage) => (
          <button
            key={percentage}
            type="button"
            onClick={() => onPercentage(percentage)}
            className="rounded-lg px-4 py-2 transition-colors"
            style={{ fontSize: "13px", fontWeight: 500, color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
            onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F6F7F9")}
            onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
          >
            {percentage}%
          </button>
        ))}
        <button
          type="button"
          onClick={onMaxAmount}
          className="rounded-lg px-4 py-2 transition-colors"
          style={{ fontSize: "13px", fontWeight: 500, color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
          onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#F6F7F9")}
          onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#FFFFFF")}
        >
          {translate("maxButton")}
        </button>
      </div>
    </div>
  );
}
