import { Check, Users } from "lucide-react";
import type { TFunction } from "i18next";
import React from "react";
import type { Contact } from "@/entities/contact";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

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

interface PickContactModalListsProperties {
  filteredContacts: Contact[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  translate: TFunction<"contacts", undefined>;
}

export function PickContactModalLists(
  properties: PickContactModalListsProperties,
) {
  const { filteredContacts, selectedAddress, onSelectAddress, translate } =
    properties;
  if (filteredContacts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
          {translate("noContactsFound")}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-1 pt-2">
      {filteredContacts.map((contact) => (
        <ContactListItem
          key={contact.id}
          contact={contact}
          isSelected={selectedAddress === contact.stellarAddress}
          onSelect={onSelectAddress}
          displayAddress={shortenStellarAddress(contact.stellarAddress)}
        />
      ))}
    </div>
  );
}
