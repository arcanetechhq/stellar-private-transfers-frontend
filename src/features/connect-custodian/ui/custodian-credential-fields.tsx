import React from "react";

type CustodianTextFieldProperties = {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  testId: string;
  onChange: (value: string) => void;
};

export function CustodianTextField(properties: CustodianTextFieldProperties) {
  return (
    <label className="custodian-field" htmlFor={properties.id}>
      <span>{properties.label}</span>
      <input
        id={properties.id}
        type="text"
        value={properties.value}
        disabled={properties.disabled}
        data-testid={properties.testId}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          properties.onChange(event.target.value);
        }}
      />
    </label>
  );
}

type CustodianPemFieldProperties = {
  label: string;
  hint: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function CustodianPemField(properties: CustodianPemFieldProperties) {
  return (
    <label className="custodian-field" htmlFor="custodian-pem">
      <span>{properties.label}</span>
      <textarea
        id="custodian-pem"
        value={properties.value}
        disabled={properties.disabled}
        data-testid="custodian-pem"
        autoComplete="off"
        spellCheck={false}
        rows={6}
        onChange={(event) => {
          properties.onChange(event.target.value);
        }}
      />
      <small>{properties.hint}</small>
    </label>
  );
}
