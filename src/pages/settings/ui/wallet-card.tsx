import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, LogOut, Copy, CheckCircle2 } from "lucide-react";
import {
  COPY_FEEDBACK_TIMEOUT_MS,
  WALLET_START_SLICE,
  WALLET_END_SLICE,
  WALLET_ADDRESS,
} from "../model/settings";

interface CopyAddressBarProperties {
  address: string;
  copied: boolean;
  onCopy: () => void;
}

function WalletInfo() {
  const { t: translate } = useTranslation("settings");

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "#F6F7F9" }}
      >
        <Wallet className="h-5 w-5" style={{ color: "#121826" }} />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <p
            className="font-semibold"
            style={{
              fontSize: "15px",
              lineHeight: "20px",
              color: "#121826",
            }}
          >
            {translate("walletName")}
          </p>
          <div
            className="flex items-center gap-1 rounded px-2 py-0.5"
            style={{ backgroundColor: "#ECFDF5" }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#10B981" }}
            />
            <span
              style={{
                fontSize: "11px",
                lineHeight: "16px",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              {translate("connected")}
            </span>
          </div>
        </div>
        <p
          className="font-mono"
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            color: "#667085",
          }}
        >
          {WALLET_ADDRESS.slice(0, WALLET_START_SLICE)}
          ...
          {WALLET_ADDRESS.slice(WALLET_END_SLICE)}
        </p>
      </div>
    </div>
  );
}

function WalletActions() {
  const { t: translate } = useTranslation("settings");

  return (
    <div className="flex gap-2">
      <button
        className="rounded-lg px-3 py-1.5 transition-colors"
        style={{
          fontSize: "13px",
          lineHeight: "18px",
          color: "#344054",
          border: "1px solid #E7EAF0",
          backgroundColor: "#FFFFFF",
          fontWeight: 500,
        }}
        onMouseEnter={(event) =>
          (event.currentTarget.style.backgroundColor = "#F6F7F9")
        }
        onMouseLeave={(event) =>
          (event.currentTarget.style.backgroundColor = "#FFFFFF")
        }
      >
        {translate("changeWallet")}
      </button>
      <button
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
        style={{
          fontSize: "13px",
          lineHeight: "18px",
          color: "#DC2626",
          border: "1px solid #FEE2E2",
          backgroundColor: "#FFFFFF",
          fontWeight: 500,
        }}
        onMouseEnter={(event) =>
          (event.currentTarget.style.backgroundColor = "#FEF2F2")
        }
        onMouseLeave={(event) =>
          (event.currentTarget.style.backgroundColor = "#FFFFFF")
        }
      >
        <LogOut className="h-3.5 w-3.5" />
        {translate("disconnect")}
      </button>
    </div>
  );
}

function CopyAddressBar(properties: CopyAddressBarProperties) {
  const { address, copied, onCopy } = properties;
  const { t: translate } = useTranslation("settings");

  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-3"
      style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}
    >
      <div>
        <p
          style={{
            fontSize: "12px",
            lineHeight: "16px",
            color: "#667085",
            marginBottom: "4px",
          }}
        >
          {translate("fullAddress")}
        </p>
        <p
          className="font-mono"
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            color: "#121826",
          }}
        >
          {address}
        </p>
      </div>
      <button
        onClick={onCopy}
        className="ml-4 flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors"
        style={{
          fontSize: "12px",
          lineHeight: "16px",
          color: copied ? "#10B981" : "#667085",
          border: "1px solid #E7EAF0",
          backgroundColor: "#FFFFFF",
          fontWeight: 500,
        }}
        onMouseEnter={(event) => {
          if (!copied) event.currentTarget.style.backgroundColor = "#F6F7F9";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = "#FFFFFF";
        }}
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {translate("copied")}
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            {translate("copy")}
          </>
        )}
      </button>
    </div>
  );
}

export function WalletCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textArea = document.createElementranslate("textarea");
    textArea.value = WALLET_ADDRESS;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.focus();
    textArea.selectranslate();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeoutranslate(() => setCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
    } catch (error) {
      console.error("Unable to copy", error);
    }

    textArea.remove();
  };

  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <div className="mb-4 flex items-start justify-between">
        <WalletInfo />
        <WalletActions />
      </div>
      <CopyAddressBar
        address={WALLET_ADDRESS}
        copied={copied}
        onCopy={handleCopy}
      />
    </div>
  );
}
