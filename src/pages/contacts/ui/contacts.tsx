import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddContactModal } from "@/features/add-contact";
import { ContactList } from "@/features/view-contact-list";
import { PageHeading } from "@/shared/ui/page-heading";

function ContactsHeader({ onAddClick }: { onAddClick: () => void }) {
  const { t: translate } = useTranslation("contacts");

  return (
    <PageHeading
      title={translate("title")}
      subtitle={translate("subtitle")}
      action={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors"
          style={{
            backgroundColor: "#111827",
            color: "#FFFFFF",
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = "#1F2937";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#111827";
          }}
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4" />
          {translate("addContact")}
        </button>
      }
    />
  );
}

export function Contacts() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-7xl">
        <ContactsHeader onAddClick={() => setShowAddModal(true)} />
        <ContactList />
      </div>
      {showAddModal && (
        <AddContactModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
