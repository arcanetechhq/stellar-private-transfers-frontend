import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

const ADDRESS_SHORT_MAX_LEN = 14;
const ADDRESS_HEAD_LEN = 8;
const ADDRESS_TAIL_LEN = 6;
const COPY_FEEDBACK_MS_DEFAULT = 2000;

function shortenStealth(address: string): string {
  if (address.length <= ADDRESS_SHORT_MAX_LEN) {
    return address;
  }
  return `${address.slice(0, ADDRESS_HEAD_LEN)}…${address.slice(-ADDRESS_TAIL_LEN)}`;
}

type StealthAddressDisplayProperties = {
  stealthAddress: string;
  showFullAddress?: boolean;
  copyFeedbackMs?: number;
};

export function StealthAddressDisplay({
  stealthAddress,
  showFullAddress = false,
  copyFeedbackMs = COPY_FEEDBACK_MS_DEFAULT,
}: StealthAddressDisplayProperties) {
  const [copied, setCopied] = useState(false);
  const displayText = showFullAddress
    ? stealthAddress
    : shortenStealth(stealthAddress);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stealthAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), copyFeedbackMs);
    } catch {
      return;
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`font-mono text-sm text-gray-900 ${showFullAddress ? "break-all" : "truncate"}`}
        title={stealthAddress}
      >
        {displayText}
      </span>
      <button
        type="button"
        className="flex shrink-0 items-center gap-1 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        onClick={handleCopy}
        aria-label="Copy private address"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
