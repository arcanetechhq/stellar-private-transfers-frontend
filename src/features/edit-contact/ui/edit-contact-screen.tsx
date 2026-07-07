import { Globe2 } from "lucide-react";
import type { Contact } from "@/entities/contact";
import { useEditContactForm } from "../lib/use-edit-contact-form";

type EditContactScreenProperties = {
  contact: Contact;
  onSuccess: () => void;
};

export function EditContactScreen({
  contact,
  onSuccess,
}: EditContactScreenProperties) {
  const {
    translate,
    name,
    setName,
    recipientValue,
    setRecipientValue,
    error,
    handleSave,
    canSubmit,
  } = useEditContactForm(contact, onSuccess);

  return (
    <section className="add-contact-route" data-testid="contacts-edit-screen">
      <div className="add-contact-flow">
        <div className="add-contact-copy">
          <h1 className="add-contact-copy__title">
            {translate("editContactTitle")}
          </h1>
          <p className="add-contact-copy__description">
            {translate("editContactDescription")}
          </p>
        </div>

        <div className="add-contact-form">
          <div className="add-contact-fields">
            <input
              className="add-contact-field"
              data-testid="contacts-edit-name-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={translate("contactNamePlaceholder")}
            />
            <label className="add-contact-identifier">
              <span className="add-contact-identifier__icon" aria-hidden="true">
                <Globe2 />
              </span>
              <span className="add-contact-identifier__copy">
                <span>{translate("stellarAddressLabel")}</span>
                <input
                  data-testid="contacts-edit-recipient-input"
                  value={recipientValue}
                  onChange={(event) => setRecipientValue(event.target.value)}
                  placeholder={translate("stellarAddressPlaceholder")}
                  spellCheck={false}
                />
              </span>
            </label>
          </div>

          {error ? <p className="add-contact-error">{error}</p> : null}

          <button
            type="button"
            className="add-contact-submit"
            disabled={!canSubmit}
            onClick={handleSave}
          >
            {translate("saveContactChanges")}
          </button>
        </div>
      </div>
    </section>
  );
}
