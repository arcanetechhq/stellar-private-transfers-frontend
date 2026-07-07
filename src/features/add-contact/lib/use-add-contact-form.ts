import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";

export function useAddContactForm(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [name, setName] = useState("");
  const [recipientValue, setRecipientValue] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleAdd = () => {
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
      addContact({ name: trimmedName, stellarAddress: trimmedRecipient }),
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
    handleAdd,
    canSubmit,
  };
}
