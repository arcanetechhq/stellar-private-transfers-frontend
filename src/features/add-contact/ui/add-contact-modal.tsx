import React from "react";
import { Plus, X } from "lucide-react";
import { ContactTextField, useAddContactForm } from "@/features/add-contact";

type AddContactModalProperties = {
  onClose: () => void;
};

export function AddContactModal(properties: AddContactModalProperties) {
  const { onClose } = properties;
  const {
    translate,
    name,
    setName,
    stellarAddress,
    setStellarAddress,
    error,
    handleAdd,
  } = useAddContactForm(onClose);

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
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = "#1F2937";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#111827";
          }}
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          {translate("addContact")}
        </button>
      </div>
    </div>
  );
}
