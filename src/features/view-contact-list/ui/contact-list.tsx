import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { COPY_FEEDBACK_TIMEOUT_MS, selectContacts } from "@/entities/contact";
import { ContactRow } from "./contact-row";

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
