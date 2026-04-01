import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TokenIcon } from "@/shared/ui/token-icon";
import type { Token } from "../model/create-deposit";
import { QUICK_PERCENTAGE_OPTIONS } from "../model/create-deposit";

interface AssetSelectorProperties {
  selectedToken: Token;
  onOpen: () => void;
}

function AssetSelector(properties: AssetSelectorProperties) {
  const { selectedToken, onOpen } = properties;
  const { t: translate } = useTranslation("deposit");
  const formattedBalance = (
    selectedToken.balance * selectedToken.price
  ).toLocaleString(undefined, {
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
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors"
        style={{ border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
        onMouseEnter={(event) =>
          (event.currentTarget.style.backgroundColor = "#F9FAFB")
        }
        onMouseLeave={(event) =>
          (event.currentTarget.style.backgroundColor = "#FFFFFF")
        }
      >
        <div className="flex items-center gap-3">
          <TokenIcon ticker={selectedToken.ticker} size={40} />
          <div className="text-left">
            <p
              className="font-semibold"
              style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
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
            ${formattedBalance}
          </p>
        </div>
      </button>
    </div>
  );
}

interface AmountInputProperties {
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
}

function AmountInput(properties: AmountInputProperties) {
  const { amount, onAmountChange, onMaxAmount, onPercentage } = properties;
  const { t: translate } = useTranslation("deposit");

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
          placeholder="0.00"
          className="w-full rounded-lg px-4 py-4 pr-20 focus:ring-2 focus:outline-none"
          style={{ border: "1px solid #E7EAF0", fontSize: "20px", fontWeight: 600, color: "#121826" }}
        />
        <button
          type="button"
          onClick={onMaxAmount}
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg px-3 py-1.5 transition-colors"
          style={{ fontSize: "13px", fontWeight: 600, color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
          onMouseEnter={(event) =>
            (event.currentTarget.style.backgroundColor = "#F6F7F9")
          }
          onMouseLeave={(event) =>
            (event.currentTarget.style.backgroundColor = "#FFFFFF")
          }
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
            onMouseEnter={(event) =>
              (event.currentTarget.style.backgroundColor = "#F6F7F9")
            }
            onMouseLeave={(event) =>
              (event.currentTarget.style.backgroundColor = "#FFFFFF")
            }
          >
            {percentage}%
          </button>
        ))}
        <button
          type="button"
          onClick={onMaxAmount}
          className="rounded-lg px-4 py-2 transition-colors"
          style={{ fontSize: "13px", fontWeight: 500, color: "#667085", border: "1px solid #E7EAF0", backgroundColor: "#FFFFFF" }}
          onMouseEnter={(event) =>
            (event.currentTarget.style.backgroundColor = "#F6F7F9")
          }
          onMouseLeave={(event) =>
            (event.currentTarget.style.backgroundColor = "#FFFFFF")
          }
        >
          {translate("max")}
        </button>
      </div>
    </div>
  );
}

function DepositInfoBanner() {
  const { t: translate } = useTranslation("deposit");

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
    >
      <div className="flex gap-3">
        <Info
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "#3B82F6" }}
        />
        <div>
          <p
            className="mb-1 font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#1E40AF" }}
          >
            {translate("aboutDeposits")}
          </p>
          <p style={{ fontSize: "13px", lineHeight: "18px", color: "#1E40AF" }}>
            {translate("aboutDepositsText")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface DepositFormProperties {
  selectedToken: Token;
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
  onPercentage: (percentage: number) => void;
  onOpenTokenPicker: () => void;
}

export function DepositForm(properties: DepositFormProperties) {
  const {
    selectedToken,
    amount,
    onAmountChange,
    onMaxAmount,
    onPercentage,
    onOpenTokenPicker,
  } = properties;

  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <div className="space-y-6">
        <AssetSelector selectedToken={selectedToken} onOpen={onOpenTokenPicker} />
        <AmountInput
          amount={amount}
          onAmountChange={onAmountChange}
          onMaxAmount={onMaxAmount}
          onPercentage={onPercentage}
        />
        <DepositInfoBanner />
      </div>
    </div>
  );
}
