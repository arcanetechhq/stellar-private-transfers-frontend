import React from "react";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NETWORK_FEE, RECIPIENT_PREFIX_LENGTH, RECIPIENT_SUFFIX_LENGTH } from "../model/create-transfer";
import type { AssetWithTrustline } from "@/entities/asset";

interface SummaryDetailsProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
}

function SummaryDetails({ selectedToken, amount, recipient }: SummaryDetailsProperties) {
  const { t: translate } = useTranslation("transfer");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";
  const displayRecipient = recipient
    ? `${recipient.slice(0, RECIPIENT_PREFIX_LENGTH)}...${recipient.slice(RECIPIENT_SUFFIX_LENGTH)}`
    : "—";

  return (
    <div className="mb-6 space-y-3">
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("asset")}
        </span>
        <span className="font-semibold" style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}>
          {ticker}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("amount")}
        </span>
        <span className="font-semibold" style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}>
          {amount || translate("amountPlaceholder")}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("recipient")}
        </span>
        <span className="font-mono" style={{ fontSize: "13px", lineHeight: "18px", color: "#121826" }}>
          {displayRecipient}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("networkFee")}
        </span>
        <span className="font-semibold" style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}>
          {NETWORK_FEE} {ticker}
        </span>
      </div>
    </div>
  );
}

interface SummaryFooterProperties {
  selectedToken: AssetWithTrustline | undefined;
  totalAmount: number;
  canSubmit: boolean;
}

function SummaryFooter({ selectedToken, totalAmount, canSubmit }: SummaryFooterProperties) {
  const { t: translate } = useTranslation("transfer");
  const ticker = selectedToken?.assetId.toUpperCase() ?? "—";

  return (
    <>
      <div className="mb-6 border-t pt-4" style={{ borderColor: "#E7EAF0" }}>
        <div className="mb-3 flex justify-between">
          <span className="font-semibold" style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}>
            {translate("total")}
          </span>
          <span className="font-semibold" style={{ fontSize: "15px", lineHeight: "22px", color: "#121826" }}>
            {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            {ticker}
          </span>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}>
          <p style={{ fontSize: "12px", lineHeight: "16px", color: "#667085", marginBottom: "4px" }}>
            {translate("type")}
          </p>
          <p className="font-semibold" style={{ fontSize: "13px", lineHeight: "18px", color: "#121826" }}>
            {translate("privateTransfer")}
          </p>
        </div>
      </div>
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
        <Send className="h-4 w-4" />
        {translate("privateSend")}
      </button>
    </>
  );
}

export interface TransferSummaryProperties {
  selectedToken: AssetWithTrustline | undefined;
  amount: string;
  recipient: string;
  totalAmount: number;
  canSubmit: boolean;
}

export function TransferSummary({ selectedToken, amount, recipient, totalAmount, canSubmit }: TransferSummaryProperties) {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 rounded-xl bg-white p-6" style={{ border: "1px solid #E7EAF0" }}>
        <h3 className="mb-4 font-semibold" style={{ fontSize: "16px", lineHeight: "24px", color: "#121826" }}>
          {translate("summary")}
        </h3>
        <SummaryDetails selectedToken={selectedToken} amount={amount} recipient={recipient} />
        <SummaryFooter selectedToken={selectedToken} totalAmount={totalAmount} canSubmit={canSubmit} />
      </div>
    </div>
  );
}
