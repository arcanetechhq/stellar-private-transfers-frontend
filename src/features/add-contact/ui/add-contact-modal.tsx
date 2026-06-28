import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { addContact } from "@/entities/contact";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";

type AddContactModalProperties = {
  onClose: () => void;
};

type ContactTextFieldProperties = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const handlePrimaryButtonMouseEnter = (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.currentTarget.style.backgroundColor = "#1F2937";
};

const handlePrimaryButtonMouseLeave = (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.currentTarget.style.backgroundColor = "#111827";
};

function ContactTextField({
  label,
  value,
  onChange,
}: ContactTextFieldProperties) {
  return (
    <div className="mb-4">
      <label
        className="mb-2 block font-medium"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#667085" }}
      >
        {label}
      </label>
      <input
        type="text"
        className="w-full rounded-lg border px-4 py-2.5"
        style={{ borderColor: "#E7EAF0" }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function AddContactModal(properties: AddContactModalProperties) {
  const { onClose } = properties;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="rounded-xl bg-white p-8"
        style={{ width: "400px", maxWidth: "90%" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-semibold"
            style={{ fontSize: "20px", lineHeight: "24px", color: "#121826" }}
          >
            {translate("addContact")}
          </h2>
          <button
            className="flex items-center justify-center"
            style={{ width: "24px", height: "24px" }}
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" style={{ color: "#667085" }} />
          </button>
        </div>
        <ContactTextField label={translate("name")} value={name} onChange={setName} />
        <ContactTextField
          label={translate("stellarAddress")}
          value={stellarAddress}
          onChange={setStellarAddress}
        />
        {error ? (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        ) : undefined}
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors"
          style={{
            backgroundColor: "#111827",
            color: "#FFFFFF",
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
          }}
          type="button"
          onMouseEnter={handlePrimaryButtonMouseEnter}
          onMouseLeave={handlePrimaryButtonMouseLeave}
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          {translate("addContact")}
        </button>
      </div>
    </div>
  );
}
