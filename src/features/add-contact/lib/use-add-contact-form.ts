import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";

export function useAddContactForm(onClose: () => void) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [name, setName] = useState("");
  const [stellarAddress, setStellarAddress] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedStellarAddress = stellarAddress.trim();
    setError(undefined);
    if (!trimmedName || !trimmedStellarAddress) {
      return;
    }
    if (!isValidStellarPublicAddress(trimmedStellarAddress)) {
      setError(translate("invalidStellarAddress"));
      return;
    }
    dispatch(
      addContact({ name: trimmedName, stellarAddress: trimmedStellarAddress }),
    );
    onClose();
  };

  return {
    translate,
    name,
    setName,
    stellarAddress,
    setStellarAddress,
    error,
    handleAdd,
  };
}
