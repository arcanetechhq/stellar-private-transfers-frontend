import React from "react";
import { BookUser, Check, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { type Contact, selectContacts } from "@/entities/contact";
import { useDismissOnOutsideClick } from "@/shared/hooks";
import { getContactInitials } from "@/features/view-contact-list";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface TransferRecipientControlProperties {
  recipient: string;
  onRecipientChange: (value: string) => void;
  excludeStellarAddress?: string;
  errorMessage?: string;
}

function RecipientAvatar({
  contact,
}: {
  contact: Contact | null;
}): React.JSX.Element {
  return (
    <span className="send-recipient-avatar" aria-hidden="true">
      {contact ? (
        getContactInitials(contact.name)
      ) : (
        <Send size={20} strokeWidth={1.7} />
      )}
    </span>
  );
}

export function TransferRecipientControl({
  recipient,
  onRecipientChange,
  excludeStellarAddress,
  errorMessage,
}: TransferRecipientControlProperties): React.JSX.Element {
  const { t: translate } = useTranslation("transfer");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const menu = useDismissOnOutsideClick<HTMLDivElement>();
  const contacts = useAppSelector(selectContacts);
  const excludeTrim = excludeStellarAddress?.trim() ?? "";
  const filteredContacts = contacts.filter((contact) => {
    if (!excludeTrim) {
      return true;
    }
    return contact.stellarAddress.trim() !== excludeTrim;
  });
  const recipientTrim = recipient.trim();
  const selectedContact =
    filteredContacts.find(
      (contact) => contact.stellarAddress.trim() === recipientTrim,
    ) ?? null;
  const recipientLabel = selectedContact
    ? selectedContact.name
    : recipientTrim
      ? translate("manualRecipient")
      : translate("recipient");

  function handleRootClick() {
    inputRef.current?.focus();
  }

  function handleRecipientChange(event: React.ChangeEvent<HTMLInputElement>) {
    onRecipientChange(event.target.value);
    menu.close();
  }

  function handleSelectContact(contact: Contact) {
    onRecipientChange(contact.stellarAddress);
    menu.close();
  }

  function handleClearRecipient(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onRecipientChange("");
    menu.close();
    inputRef.current?.focus();
  }

  function handleToggleContacts(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    menu.toggle();
  }

  return (
    <div
      ref={menu.ref}
      className="send-recipient-control"
      data-invalid={errorMessage ? "true" : undefined}
      onClick={handleRootClick}
    >
      <div className="send-recipient-control__field">
        <RecipientAvatar contact={selectedContact} />
        <div className="send-recipient-control__input-wrap">
          <span className="send-recipient-control__name">{recipientLabel}</span>
          <input
            ref={inputRef}
            aria-label={translate("recipientAddress")}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={
              errorMessage ? "transfer-recipient-error" : undefined
            }
            value={recipient}
            onChange={handleRecipientChange}
            placeholder={translate("recipientPlaceholder")}
            spellCheck={false}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
        <div className="send-recipient-control__actions">
          {recipient ? (
            <button
              type="button"
              className="send-recipient-control__clear"
              aria-label={translate("clearRecipient")}
              onClick={handleClearRecipient}
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          ) : null}
          <button
            type="button"
            className="send-recipient-control__book"
            data-open={menu.isOpen ? "true" : undefined}
            aria-label={translate("selectContact")}
            aria-haspopup="menu"
            aria-expanded={menu.isOpen}
            onClick={handleToggleContacts}
          >
            <BookUser size={19} strokeWidth={1.7} />
          </button>
        </div>
      </div>
      {errorMessage ? (
        <p
          id="transfer-recipient-error"
          className="send-recipient-control__error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      {menu.isOpen ? (
        <div className="send-recipient-menu" role="menu" aria-label={translate("selectContact")}>
          {filteredContacts.length === 0 ? (
            <p className="send-recipient-menu__empty">{translate("noContactsFound")}</p>
          ) : (
            filteredContacts.map((contact) => (
              <button
                type="button"
                key={contact.id}
                className="send-recipient-option"
                data-active={
                  selectedContact?.id === contact.id ? "true" : undefined
                }
                role="menuitemradio"
                aria-checked={selectedContact?.id === contact.id}
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelectContact(contact);
                }}
              >
                <RecipientAvatar contact={contact} />
                <span className="send-recipient-option__copy">
                  <span>{contact.name}</span>
                  <span>{shortenStellarAddress(contact.stellarAddress)}</span>
                </span>
                <span className="send-recipient-option__method">
                  {translate("stellarAddress")}
                </span>
                {selectedContact?.id === contact.id ? (
                  <Check size={16} strokeWidth={1.7} />
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
