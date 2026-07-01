import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import type { ContactAccountType } from "@/entities/contact";

export function useAddContactForm(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [type, setType] = useState<ContactAccountType>("publicAddress");
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
    if (type !== "publicAddress") {
      setError(translate("unsupportedContactType"));
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
    type,
    setType,
    name,
    setName,
    recipientValue,
    setRecipientValue,
    error,
    handleAdd,
    canSubmit,
  };
}
