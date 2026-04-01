import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Copy, Check } from "lucide-react";
import type { Contact } from "@/entities/contact";

const handleRowMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
  event.currentTarget.style.backgroundColor = "#F9FAFB";
};

const handleRowMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
  event.currentTarget.style.backgroundColor = "transparent";
};

interface ContactRowProperties {
  contact: Contact;
  isCopied: boolean;
  onCopyAddress: (id: number, address: string) => void;
}

export function ContactRow(properties: ContactRowProperties) {
  const { contact, isCopied, onCopyAddress } = properties;
  const { t: translate } = useTranslation("contacts");
  const copyColor = isCopied ? "#10B981" : "#667085";

  const handleCopyMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCopied) {
      event.currentTarget.style.backgroundColor = "#F9FAFB";
    }
  };

  const handleCopyMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCopied) {
      event.currentTarget.style.backgroundColor = "#FFFFFF";
    }
  };

  return (
    <div
      className="cursor-pointer px-6 py-4 transition-colors"
      onMouseEnter={handleRowMouseEnter}
      onMouseLeave={handleRowMouseLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            <Users className="h-6 w-6" style={{ color: "#6B7280" }} />
          </div>
          <div>
            <div
              className="mb-1 font-semibold"
              style={{ fontSize: "16px", lineHeight: "24px", color: "#121826" }}
            >
              {contact.name}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                color: "#667085",
              }}
            >
              {contact.stealthAddress}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopyAddress(contact.id, contact.stealthAddress)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
            border: "1px solid #E7EAF0",
            backgroundColor: "#FFFFFF",
            color: copyColor,
          }}
          onMouseEnter={handleCopyMouseEnter}
          onMouseLeave={handleCopyMouseLeave}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              {translate("copied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {translate("copy")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
