import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { updateContact, type Contact } from "@/entities/contact";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";

export function useEditContactForm(contact: Contact, onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [name, setName] = useState(contact.name);
  const [recipientValue, setRecipientValue] = useState(contact.stellarAddress);
  const [error, setError] = useState<string | undefined>();

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedRecipient = recipientValue.trim();
    setError(undefined);
    if (!trimmedName || !trimmedRecipient) {
      return;
    }
    if (!isValidStellarPublicAddress(trimmedRecipient)) {
      setError(translate("invalidStellarAddress"));
      return;
    }
    dispatch(
      updateContact({
        id: contact.id,
        name: trimmedName,
        stellarAddress: trimmedRecipient,
      }),
    );
    onSuccess();
  };

  const canSubmit = Boolean(name.trim() && recipientValue.trim());

  return {
    translate,
    name,
    setName,
    recipientValue,
    setRecipientValue,
    error,
    handleSave,
    canSubmit,
  };
}
