import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Users } from "lucide-react";
import { useAppSelector } from "@/store";
import {
  COPY_FEEDBACK_TIMEOUT_MS,
  selectContacts,
  type Contact,
} from "@/entities/contact";

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

function ContactRow(properties: ContactRowProperties) {
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
              {contact.stellarAddress}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopyAddress(contact.id, contact.stellarAddress)}
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

export function ContactList() {
  const contacts = useAppSelector(selectContacts);
  const [copiedId, setCopiedId] = useState<number | undefined>();
  const { t: translate } = useTranslation("contacts");

  const handleCopyAddress = async (id: number, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(undefined), COPY_FEEDBACK_TIMEOUT_MS);
    } catch (error) {
      console.error("Unable to copy", error);
    }
  };

  if (contacts.length === 0) {
    return (
      <div
        className="rounded-xl bg-white py-12 text-center"
        style={{ border: "1px solid #E7EAF0" }}
      >
        <Users
          className="mx-auto mb-3 h-12 w-12"
          style={{ color: "#D1D5DB" }}
        />
        <p
          className="mb-1 font-medium"
          style={{ fontSize: "16px", lineHeight: "24px", color: "#121826" }}
        >
          {translate("noContactsYet")}
        </p>
        <p style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}>
          {translate("addContactsHint")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl bg-white"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <div className="divide-y" style={{ borderColor: "#E7EAF0" }}>
        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isCopied={copiedId === contact.id}
            onCopyAddress={handleCopyAddress}
          />
        ))}
      </div>
    </div>
  );
}
