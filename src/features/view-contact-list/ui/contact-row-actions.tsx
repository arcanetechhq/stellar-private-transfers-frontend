import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { SyntheticEvent } from "react";
import type { Contact } from "@/entities/contact";
import { DeleteContactDialog } from "@/features/delete-contact";

type ContactRowActionsProperties = {
  contact: Contact;
  onSendMoney: (contact: Contact) => void;
};

export function ContactRowActions({
  contact,
  onSendMoney,
}: ContactRowActionsProperties) {
  const navigate = useNavigate();
  const { t: translate } = useTranslation("contacts");

  function stopRowActivation(event: SyntheticEvent) {
    event.stopPropagation();
  }

  return (
    <div
      className="contact-row-actions"
      onClick={stopRowActivation}
      onPointerDown={stopRowActivation}
    >
      <button
        type="button"
        className="contact-send-button"
        onClick={(event) => {
          stopRowActivation(event);
          onSendMoney(contact);
        }}
      >
        {translate("sendMoney")}
      </button>
      <button
        type="button"
        className="contact-row-action-button"
        aria-label={translate("editContact")}
        onClick={(event) => {
          stopRowActivation(event);
          navigate(`/contacts/${contact.id}/edit`);
        }}
      >
        <Pencil aria-hidden="true" />
      </button>
      <DeleteContactDialog contact={contact} />
    </div>
  );
}
