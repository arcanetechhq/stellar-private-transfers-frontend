import React from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Token } from "../model/create-deposit";

interface SummaryLineItemsProperties {
  selectedToken: Token;
  amount: string;
  fiatValue: number;
  networkFee: number;
}

function SummaryLineItems(properties: SummaryLineItemsProperties) {
  const { selectedToken, amount, fiatValue, networkFee } = properties;
  const { t: translate } = useTranslation("deposit");
  const showFiatValue = amount !== "" && Number.parseFloat(amount) > 0;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("asset")}
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
        >
          {selectedToken.ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("amount")}
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
        >
          {amount || "0.00"}
        </span>
      </div>
      {showFiatValue && (
        <div className="flex justify-between">
          <span style={{ fontSize: "13px", lineHeight: "18px", color: "#98A2B3" }}>
            {translate("fiatValue")}
          </span>
          <span style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
            $
            {fiatValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("networkFee")}
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
        >
          ${networkFee.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

interface SummaryReceiveInfoProperties {
  receivedAmount: number;
  ticker: string;
}

function SummaryReceiveInfo(properties: SummaryReceiveInfoProperties) {
  const { receivedAmount, ticker } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="mb-6 border-t pt-4" style={{ borderColor: "#E7EAF0" }}>
      <div className="mb-3 flex justify-between">
        <span
          className="font-semibold"
          style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}
        >
          {translate("youWillReceive")}
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}
        >
          {receivedAmount.toLocaleString()} {ticker}
        </span>
      </div>
      <div
        className="rounded-lg p-3"
        style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}
      >
        <p
          style={{
            fontSize: "12px",
            lineHeight: "16px",
            color: "#667085",
            marginBottom: "4px",
          }}
        >
          {translate("destination")}
        </p>
        <p
          className="font-semibold"
          style={{ fontSize: "13px", lineHeight: "18px", color: "#121826" }}
        >
          {translate("privateBalance")}
        </p>
      </div>
    </div>
  );
}

interface DepositSummaryProperties {
  selectedToken: Token;
  amount: string;
  fiatValue: number;
  networkFee: number;
  receivedAmount: number;
  canSubmit: boolean;
}

export function DepositSummary(properties: DepositSummaryProperties) {
  const {
    selectedToken,
    amount,
    fiatValue,
    networkFee,
    receivedAmount,
    canSubmit,
  } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div
      className="sticky top-6 rounded-xl bg-white p-6"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <h3
        className="mb-4 font-semibold"
        style={{ fontSize: "16px", lineHeight: "24px", color: "#121826" }}
      >
        {translate("summary")}
      </h3>
      <SummaryLineItems
        selectedToken={selectedToken}
        amount={amount}
        fiatValue={fiatValue}
        networkFee={networkFee}
      />
      <SummaryReceiveInfo
        receivedAmount={receivedAmount}
        ticker={selectedToken.ticker}
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all"
        style={{
          fontSize: "15px",
          lineHeight: "22px",
          backgroundColor: canSubmit ? "#111827" : "#E7EAF0",
          color: canSubmit ? "#FFFFFF" : "#98A2B3",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
        onMouseEnter={(event) => {
          if (canSubmit)
            event.currentTarget.style.backgroundColor = "#1F2937";
        }}
        onMouseLeave={(event) => {
          if (canSubmit)
            event.currentTarget.style.backgroundColor = "#111827";
        }}
      >
        <Download className="h-4 w-4" />
        {translate("confirmDeposit")}
      </button>
    </div>
  );
}
