import { Globe2 } from "lucide-react";
import { useAddContactForm } from "../lib/use-add-contact-form";

type AddContactScreenProperties = {
  onSuccess: () => void;
};

export function AddContactScreen({ onSuccess }: AddContactScreenProperties) {
  const {
    translate,
    name,
    setName,
    recipientValue,
    setRecipientValue,
    error,
    handleAdd,
    canSubmit,
  } = useAddContactForm(onSuccess);

  return (
    <section className="add-contact-route" data-testid="contacts-new-screen">
      <div className="add-contact-flow">
        <div className="add-contact-copy">
          <h1 className="add-contact-copy__title">{translate("addContactTitle")}</h1>
          <p className="add-contact-copy__description">
            {translate("addContactDescription")}
          </p>
        </div>

        <div className="add-contact-form">
          <div className="add-contact-fields">
            <input
              className="add-contact-field"
              data-testid="contacts-name-input"
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
                  data-testid="contacts-recipient-input"
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
            onClick={handleAdd}
          >
            {translate("addContact")}
          </button>
        </div>
      </div>
    </section>
  );
}
