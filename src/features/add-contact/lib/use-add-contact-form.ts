import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidPrivateAddressString } from "@/shared/lib/private-address/validate-private-address";

export function useAddContactForm(onClose: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [name, setName] = useState("");
  const [privateAddress, setPrivateAddress] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedPrivateAddress = privateAddress.trim();
    setError(undefined);
    if (!trimmedName || !trimmedPrivateAddress) {
      return;
    }
    if (!isValidPrivateAddressString(trimmedPrivateAddress)) {
      setError(translate("invalidPrivateAddress"));
      return;
    }
    dispatch(
      addContact({ name: trimmedName, privateAddress: trimmedPrivateAddress }),
    );
    onClose();
  };

  return {
    translate,
    name,
    setName,
    privateAddress,
    setPrivateAddress,
    error,
    handleAdd,
  };
}
