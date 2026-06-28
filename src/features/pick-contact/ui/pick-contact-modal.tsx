import { Check, Users, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectContacts, type Contact } from "@/entities/contact";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface PickContactModalProperties {
  open: boolean;
  selectedAddress: string;
  onSelect: (address: string) => void;
  onClose: () => void;
  excludeStellarAddress?: string;
}

interface ContactListItemProperties {
  contact: Contact;
  isSelected: boolean;
  onSelect: (address: string) => void;
  displayAddress: string;
}

function ContactListItem(properties: ContactListItemProperties) {
  const { contact, isSelected, onSelect, displayAddress } = properties;
  return (
    <button
      type="button"
      onClick={() => onSelect(contact.stellarAddress)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors ${
        isSelected
          ? "bg-[var(--surface-selected)]"
          : "hover:bg-[var(--surface-hover)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neutral-bg)]">
          <Users className="h-5 w-5 text-[var(--foreground-secondary)]" />
        </div>
        <div className="text-left">
          <p className="text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            {contact.name}
          </p>
          <p className="font-mono text-xs leading-4 text-[var(--foreground-secondary)]">
            {displayAddress}
          </p>
        </div>
      </div>
      {isSelected ? (
        <Check className="h-5 w-5 text-[var(--success)]" />
      ) : undefined}
    </button>
  );
}

export function PickContactModal(properties: PickContactModalProperties) {
  const {
    open,
    selectedAddress,
    onSelect,
    onClose,
    excludeStellarAddress,
  } = properties;
  const contacts = useAppSelector(selectContacts);
  const { t: translate } = useTranslation("contacts");
  const excludeTrim = excludeStellarAddress?.trim() ?? "";

  if (!open) {
    return;
  }

  const handleSelect = (address: string) => {
    onSelect(address);
    onClose();
  };

  const filteredContacts = contacts.filter((contact) => {
    if (!excludeTrim) {
      return true;
    }
    return contact.stellarAddress.trim() !== excludeTrim;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-backdrop)]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="m-4 flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-[var(--surface-card)] shadow-[var(--shadow-modal)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pick-contact-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <h3
            id="pick-contact-title"
            className="text-[18px] leading-7 font-semibold text-[var(--foreground-primary)]"
          >
            {translate("selectContact")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
                {translate("noContactsFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-1 pt-2">
              {filteredContacts.map((contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedAddress === contact.stellarAddress}
                  onSelect={handleSelect}
                  displayAddress={shortenStellarAddress(contact.stellarAddress)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
