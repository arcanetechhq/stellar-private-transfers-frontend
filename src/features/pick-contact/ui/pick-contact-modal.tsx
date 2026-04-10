import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectContacts } from "@/entities/contact";
import {
  PickContactModalLists,
  type StealthPickerRow,
} from "@/features/pick-contact";

interface PickContactModalProperties {
  open: boolean;
  selectedAddress: string;
  onSelect: (address: string) => void;
  onClose: () => void;
  excludeStealthAddress?: string;
  stealthRows?: StealthPickerRow[];
}

export function PickContactModal(properties: PickContactModalProperties) {
  const {
    open,
    selectedAddress,
    onSelect,
    onClose,
    excludeStealthAddress,
    stealthRows = [],
  } = properties;
  const contacts = useAppSelector(selectContacts);
  const { t: translate } = useTranslation("contacts");
  const excludeTrim = excludeStealthAddress?.trim() ?? "";

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
    return contact.stealthAddress.trim() !== excludeTrim;
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
          <PickContactModalLists
            stealthRows={stealthRows}
            filteredContacts={filteredContacts}
            selectedAddress={selectedAddress}
            onSelectAddress={handleSelect}
            translate={translate}
          />
        </div>
      </div>
    </div>
  );
}
