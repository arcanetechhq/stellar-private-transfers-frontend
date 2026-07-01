import React from "react";

type ContactTextFieldProperties = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ContactTextField({
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
