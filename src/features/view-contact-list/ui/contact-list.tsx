import { useCallback, useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/store";
import { selectContacts, type Contact } from "@/entities/contact";
import { getContactInitials } from "../lib/get-contact-initials";
import { ContactRowActions } from "./contact-row-actions";
import { ContactTypeBadge } from "./contact-type-badge";
import { ContactsSearchField } from "./contacts-search-field";
import { RecordsTableContent } from "./records-table-content";

type ContactListProperties = {
  onAddContact: () => void;
};

function filterContacts(contacts: Contact[], search: string): Contact[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return contacts;
  }
  return contacts.filter((contact) =>
    `${contact.name} ${contact.stellarAddress}`.toLowerCase().includes(query),
  );
}

function ContactsEmptyState() {
  const { t: translate } = useTranslation("contacts");

  return (
    <div className="contacts-empty">
      <span className="contacts-empty__icon" aria-hidden="true">
        <Users />
      </span>
      <p className="contacts-empty__title">{translate("noContactsYet")}</p>
      <p className="contacts-empty__text">{translate("addContactsHint")}</p>
    </div>
  );
}

export function ContactList({ onAddContact }: ContactListProperties) {
  const contacts = useAppSelector(selectContacts);
  const navigate = useNavigate();
  const { t: translate } = useTranslation("contacts");
  const [search, setSearch] = useState("");
  const visibleContacts = useMemo(
    () => filterContacts(contacts, search),
    [contacts, search],
  );

  const handleSendMoney = useCallback(
    (contact: Contact) => {
      navigate(
        `/create-transfer?recipient=${encodeURIComponent(contact.stellarAddress)}`,
      );
    },
    [navigate],
  );

  const contactColumns = useMemo(
    () => [
      {
        key: "name",
        title: translate("columnName"),
        render: (contact: Contact) => (
          <div className="records-table__entity">
            <span className="record-avatar">
              {getContactInitials(contact.name)}
            </span>
            <span className="records-table__entity-name">{contact.name}</span>
          </div>
        ),
      },
      {
        key: "type",
        title: translate("columnAccountType"),
        render: () => <ContactTypeBadge type="publicAddress" />,
      },
      {
        key: "account",
        title: translate("columnAccount"),
        render: (contact: Contact) => contact.stellarAddress,
      },
      {
        key: "action",
        title: "",
        align: "right" as const,
        render: (contact: Contact) => (
          <ContactRowActions contact={contact} onSendMoney={handleSendMoney} />
        ),
      },
    ],
    [handleSendMoney, translate],
  );

  return (
    <section className="records-card contacts-records ui-card" aria-label={translate("title")}>
      <div className="full-records-toolbar">
        <ContactsSearchField
          placeholder={translate("search")}
          value={search}
          onChange={setSearch}
        />
        <button
          type="button"
          className="contacts-action-button"
          onClick={onAddContact}
        >
          <Plus aria-hidden="true" />
          {translate("newContact")}
        </button>
      </div>
      {contacts.length === 0 ? (
        <ContactsEmptyState />
      ) : (
        <RecordsTableContent
          columns={contactColumns}
          rows={visibleContacts}
          onRowClick={handleSendMoney}
        />
      )}
    </section>
  );
}
