import { Check, Users, Wallet } from "lucide-react";
import type { TFunction } from "i18next";
import React from "react";
import type { Contact } from "@/entities/contact";
import { shortenPrivateAddressForDisplay } from "@/shared/lib/private-address/shorten-private-address-for-display";
import type { PrivateAddressPickerRow } from "@/features/pick-contact";

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
      onClick={() => onSelect(contact.privateAddress)}
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

interface PrivateAddressRowListItemProperties {
  row: PrivateAddressPickerRow;
  isSelected: boolean;
  onSelect: (address: string) => void;
  title: string;
  displayAddress: string;
}

function PrivateAddressRowListItem(properties: PrivateAddressRowListItemProperties) {
  const { row, isSelected, onSelect, title, displayAddress } = properties;
  return (
    <button
      type="button"
      onClick={() => onSelect(row.privateAddress)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors ${
        isSelected
          ? "bg-[var(--surface-selected)]"
          : "hover:bg-[var(--surface-hover)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neutral-bg)]">
          <Wallet className="h-5 w-5 text-[var(--foreground-secondary)]" />
        </div>
        <div className="text-left">
          <p className="text-[14px] leading-[20px] font-semibold text-[var(--foreground-primary)]">
            {title}
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

interface PrivateAddressRowsSectionProperties {
  rows: PrivateAddressPickerRow[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  translate: TFunction<"contacts", undefined>;
}

function PrivateAddressRowsSection(properties: PrivateAddressRowsSectionProperties) {
  const { rows, selectedAddress, onSelectAddress, translate } = properties;
  if (rows.length === 0) {
    return;
  }
  return (
    <div>
      <p className="px-3 pb-2 text-xs font-medium tracking-wide text-[var(--foreground-tertiary)] uppercase">
        {translate("myPrivateAddresses")}
      </p>
      <div className="space-y-1">
        {rows.map((row) => (
          <PrivateAddressRowListItem
            key={row.id}
            row={row}
            isSelected={selectedAddress === row.privateAddress}
            onSelect={onSelectAddress}
            title={row.nonceKey}
            displayAddress={shortenPrivateAddressForDisplay(row.privateAddress)}
          />
        ))}
      </div>
    </div>
  );
}

interface SavedContactsSectionProperties {
  contacts: Contact[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  translate: TFunction<"contacts", undefined>;
  showSavedHeading: boolean;
}

function SavedContactsSection(properties: SavedContactsSectionProperties) {
  const {
    contacts,
    selectedAddress,
    onSelectAddress,
    translate,
    showSavedHeading,
  } = properties;
  if (contacts.length === 0) {
    return;
  }
  return (
    <div>
      {showSavedHeading ? (
        <p className="px-3 pb-2 text-xs font-medium tracking-wide text-[var(--foreground-tertiary)] uppercase">
          {translate("savedContacts")}
        </p>
      ) : undefined}
      <div className="space-y-1">
        {contacts.map((contact) => (
          <ContactListItem
            key={contact.id}
            contact={contact}
            isSelected={selectedAddress === contact.privateAddress}
            onSelect={onSelectAddress}
            displayAddress={shortenPrivateAddressForDisplay(contact.privateAddress)}
          />
        ))}
      </div>
    </div>
  );
}

interface PickContactModalListsProperties {
  privateAddressRows: PrivateAddressPickerRow[];
  filteredContacts: Contact[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  translate: TFunction<"contacts", undefined>;
}

export function PickContactModalLists(
  properties: PickContactModalListsProperties,
) {
  const {
    privateAddressRows,
    filteredContacts,
    selectedAddress,
    onSelectAddress,
    translate,
  } = properties;
  const hasRows = privateAddressRows.length > 0 || filteredContacts.length > 0;
  if (!hasRows) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] leading-5 text-[var(--foreground-secondary)]">
          {translate("noContactsFound")}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 pt-2">
      <PrivateAddressRowsSection
        rows={privateAddressRows}
        selectedAddress={selectedAddress}
        onSelectAddress={onSelectAddress}
        translate={translate}
      />
      <SavedContactsSection
        contacts={filteredContacts}
        selectedAddress={selectedAddress}
        onSelectAddress={onSelectAddress}
        translate={translate}
        showSavedHeading={privateAddressRows.length > 0}
      />
    </div>
  );
}
