import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidStealthAddressString } from "@/shared/lib/stealth/validate-stealth-address";

export function useAddContactForm(onClose: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [name, setName] = useState("");
  const [stealthAddress, setStealthAddress] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedStealth = stealthAddress.trim();
    setError(undefined);
    if (!trimmedName || !trimmedStealth) {
      return;
    }
    if (!isValidStealthAddressString(trimmedStealth)) {
      setError(translate("invalidPrivateAddress"));
      return;
    }
    dispatch(
      addContact({ name: trimmedName, stealthAddress: trimmedStealth }),
    );
    onClose();
  };

  return {
    translate,
    name,
    setName,
    stealthAddress,
    setStealthAddress,
    error,
    handleAdd,
  };
}
