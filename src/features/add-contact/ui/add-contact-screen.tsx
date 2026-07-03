import { AtSign, Globe2, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAddContactForm } from "../lib/use-add-contact-form";
import type { ContactAccountType } from "@/entities/contact";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";

type AddContactScreenProperties = {
  onSuccess: () => void;
};

type ContactTypeOption = {
  labelKey: "accountTypeUserId" | "accountTypePublicAddress" | "accountTypePrivateAddress";
  value: ContactAccountType;
  icon: LucideIcon;
  placeholderKey: "userIdPlaceholder" | "publicAddressPlaceholder" | "privateAddressPlaceholder";
  fieldLabelKey: "userIdLabel" | "publicAddressLabel" | "privateAddressLabel";
};

const contactTypeOptions: ContactTypeOption[] = [
  {
    labelKey: "accountTypeUserId",
    value: "userId",
    icon: AtSign,
    placeholderKey: "userIdPlaceholder",
    fieldLabelKey: "userIdLabel",
  },
  {
    labelKey: "accountTypePublicAddress",
    value: "publicAddress",
    icon: Globe2,
    placeholderKey: "publicAddressPlaceholder",
    fieldLabelKey: "publicAddressLabel",
  },
  {
    labelKey: "accountTypePrivateAddress",
    value: "privateAddress",
    icon: ShieldCheck,
    placeholderKey: "privateAddressPlaceholder",
    fieldLabelKey: "privateAddressLabel",
  },
].filter(
  (option) => !HIDDEN_FEATURES.userId || option.value !== "userId",
);

export function AddContactScreen({ onSuccess }: AddContactScreenProperties) {
  const {
    translate,
    type,
    setType,
    name,
    setName,
    recipientValue,
    setRecipientValue,
    error,
    handleAdd,
    canSubmit,
  } = useAddContactForm(onSuccess);
  const selectedType =
    contactTypeOptions.find((option) => option.value === type) ??
    contactTypeOptions[1];
  const SelectedTypeIcon = selectedType.icon;

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
          {!HIDDEN_FEATURES.addContactTypeTabs ? (
            <div
              className="add-contact-tabs"
              role="tablist"
              aria-label={translate("contactTypeTabsLabel")}
            >
              {contactTypeOptions.map((option) => {
                const TypeIcon = option.icon;
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={type === option.value}
                    className="add-contact-tab"
                    data-active={type === option.value ? "true" : undefined}
                    key={option.value}
                    onClick={() => {
                      setType(option.value);
                      setRecipientValue("");
                    }}
                  >
                    <TypeIcon aria-hidden="true" />
                    {translate(option.labelKey)}
                  </button>
                );
              })}
            </div>
          ) : null}

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
                <SelectedTypeIcon />
              </span>
              <span className="add-contact-identifier__copy">
                <span>{translate(selectedType.fieldLabelKey)}</span>
                <input
                  data-testid="contacts-recipient-input"
                  value={recipientValue}
                  onChange={(event) => setRecipientValue(event.target.value)}
                  placeholder={translate(selectedType.placeholderKey)}
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
