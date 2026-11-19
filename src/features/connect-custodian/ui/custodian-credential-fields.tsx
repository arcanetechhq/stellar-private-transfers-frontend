import React from "react";
import { useTranslation } from "react-i18next";
import {
  FIREBLOCKS_ENVIRONMENTS,
  fireblocksEnvironmentFor,
  type FireblocksEnvironmentId,
} from "../model/fireblocks-environment";

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

const ENVIRONMENT_LABEL_KEYS: Record<FireblocksEnvironmentId, string> = {
  sandbox: "environmentSandbox",
  stand: "environmentStand",
};

type CustodianEnvironmentFieldProperties = {
  environmentId: FireblocksEnvironmentId;
  disabled: boolean;
  onChange: (environmentId: FireblocksEnvironmentId) => void;
};

export function CustodianEnvironmentField(
  properties: CustodianEnvironmentFieldProperties,
) {
  const { t: translate } = useTranslation("custodian");
  const environment = fireblocksEnvironmentFor(properties.environmentId);

  return (
    <label className="custodian-field" htmlFor="custodian-environment">
      <span>{translate("environmentLabel")}</span>
      <select
        id="custodian-environment"
        data-testid="custodian-environment"
        value={properties.environmentId}
        disabled={properties.disabled}
        onChange={(event) => {
          const next = FIREBLOCKS_ENVIRONMENTS.find(
            (item) => item.id === event.target.value,
          );
          if (next) {
            properties.onChange(next.id);
          }
        }}
      >
        {FIREBLOCKS_ENVIRONMENTS.map((item) => (
          <option key={item.id} value={item.id}>
            {translate(ENVIRONMENT_LABEL_KEYS[item.id])}
          </option>
        ))}
      </select>
      <small data-testid="custodian-base-url">{environment.baseUrl}</small>
    </label>
  );
}
