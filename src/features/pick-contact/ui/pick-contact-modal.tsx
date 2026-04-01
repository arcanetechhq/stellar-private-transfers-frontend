import React from "react";
import { X, Check, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/hooks";
import type { Contact } from "@/entities/contact";
import { selectContacts } from "@/entities/contact";

interface ContactListItemProperties {
  contact: Contact;
  isSelected: boolean;
  onSelect: (address: string) => void;
}

function ContactListItem(properties: ContactListItemProperties) {
  const { contact, isSelected, onSelect } = properties;
  return (
    <button
      type="button"
      onClick={() => onSelect(contact.stealthAddress)}
      className="flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors"
      style={{ backgroundColor: isSelected ? "#F6F7F9" : "transparent" }}
      onMouseEnter={(event) => {
        if (!isSelected) event.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(event) => {
        if (!isSelected) event.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <Users className="h-5 w-5" style={{ color: "#6B7280" }} />
        </div>
        <div className="text-left">
          <p
            className="font-semibold"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
          >
            {contact.name}
          </p>
          <p
            className="font-mono"
            style={{ fontSize: "12px", lineHeight: "16px", color: "#667085" }}
          >
            {contact.stealthAddress}
          </p>
        </div>
      </div>
      {isSelected && <Check className="h-5 w-5" style={{ color: "#10B981" }} />}
    </button>
  );
}

interface PickContactModalProperties {
  open: boolean;
  selectedAddress: string;
  onSelect: (address: string) => void;
  onClose: () => void;
}

export function PickContactModal(properties: PickContactModalProperties) {
  const { open, selectedAddress, onSelect, onClose } = properties;
  const contacts = useAppSelector(selectContacts);
  const { t: translate } = useTranslation("contacts");

  if (!open) {
    return;
  }

  const handleSelect = (address: string) => {
    onSelect(address);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="m-4 w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex items-center justify-between border-b p-6"
          style={{ borderColor: "#E7EAF0" }}
        >
          <h3
            className="font-semibold"
            style={{ fontSize: "18px", lineHeight: "28px", color: "#121826" }}
          >
            {translate("selectContact")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors"
            style={{ color: "#667085" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "#F6F7F9";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {contacts.length === 0 ? (
            <div className="py-12 text-center">
              <p
                style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}
              >
                {translate("noContactsFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {contacts.map((contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedAddress === contact.stealthAddress}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
