import React from "react";
import { ArrowUpFromLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Token } from "../model/create-withdrawal";

interface SummaryLineItemsProperties {
  selectedToken: Token;
  amount: string;
  fiatValue: number;
  networkFee: number;
  showFiatValue: boolean;
}

function SummaryLineItems(properties: SummaryLineItemsProperties) {
  const { selectedToken, amount, fiatValue, networkFee, showFiatValue } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>{translate("asset")}</span>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
        >
          {selectedToken.ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>{translate("amount")}</span>
        <span
          className="font-semibold"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
        >
          {amount || translate("amountPlaceholder")}
        </span>
      </div>
      {showFiatValue && (
        <div className="flex justify-between">
          <span style={{ fontSize: "13px", lineHeight: "18px", color: "#98A2B3" }}>
            {translate("fiatValue")}
          </span>
          <span style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}>
            ${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

interface ConfirmButtonProperties {
  canSubmit: boolean;
}

function ConfirmButton(properties: ConfirmButtonProperties) {
  const { canSubmit } = properties;
  const { t: translate } = useTranslation("withdrawal");

  return (
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
        if (canSubmit) event.currentTarget.style.backgroundColor = "#1F2937";
      }}
      onMouseLeave={(event) => {
        if (canSubmit) event.currentTarget.style.backgroundColor = "#111827";
      }}
    >
      <ArrowUpFromLine className="h-4 w-4" />
      {translate("confirmWithdrawal")}
    </button>
  );
}

interface WithdrawalSummaryProperties {
  selectedToken: Token;
  amount: string;
  fiatValue: number;
  networkFee: number;
  receivedAmount: number;
  destinationWallet: string;
  canSubmit: boolean;
}

export function WithdrawalSummary(properties: WithdrawalSummaryProperties) {
  const {
    selectedToken, amount, fiatValue, networkFee,
    receivedAmount, destinationWallet, canSubmit,
  } = properties;
  const { t: translate } = useTranslation("withdrawal");
  const showFiatValue = amount !== "" && Number.parseFloat(amount) > 0;

  return (
    <div className="lg:col-span-1">
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
          showFiatValue={showFiatValue}
        />
        <div className="mb-6 border-t pt-4" style={{ borderColor: "#E7EAF0" }}>
          <div className="mb-3 flex justify-between">
            <span
              className="font-semibold"
              style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}
            >
              {translate("toReceive")}
            </span>
            <span
              className="font-semibold"
              style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}
            >
              {receivedAmount.toLocaleString()} {selectedToken.ticker}
            </span>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}
          >
            <p style={{ fontSize: "12px", lineHeight: "16px", color: "#667085", marginBottom: "4px" }}>
              {translate("destination")}
            </p>
            <p
              className="font-mono font-semibold"
              style={{ fontSize: "13px", lineHeight: "18px", color: "#121826" }}
            >
              {destinationWallet}
            </p>
          </div>
        </div>
        <ConfirmButton canSubmit={canSubmit} />
      </div>
    </div>
  );
}
