import React from "react";
import { useTranslation } from "react-i18next";
import type {
  CustodianWizardActions,
  CustodianWizardModel,
} from "../model/custodian-wizard-model";
import {
  CustodianPemField,
  CustodianTextField,
} from "./custodian-credential-fields";

type CustodianCredentialsStepProperties = {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
};

function CustodianCredentialActions(properties: {
  isSubmitting: boolean;
  onBack: () => void;
}) {
  const { t: translate } = useTranslation("custodian");
  return (
    <div className="custodian-wizard__actions">
      <button
        type="button"
        className="custodian-wizard__secondary"
        onClick={properties.onBack}
        disabled={properties.isSubmitting}
      >
        {translate("back")}
      </button>
      <button
        type="submit"
        className="custodian-wizard__primary"
        data-testid="custodian-submit-credentials"
        disabled={properties.isSubmitting}
      >
        {properties.isSubmitting
          ? translate("listingWallets")
          : translate("listWallets")}
      </button>
    </div>
  );
}

export function CustodianCredentialsStep(
  properties: CustodianCredentialsStepProperties,
) {
  const { t: translate } = useTranslation("custodian");
  const { model, actions } = properties;
  const pemHint = model.hasStoredSigningKey
    ? translate("pemStoredHint")
    : translate("pemHint");

  return (
    <form
      className="custodian-wizard__step"
      onSubmit={(event) => {
        event.preventDefault();
        if (!model.isSubmitting) {
          actions.submitCredentials();
        }
      }}
    >
      <h2 id="custodian-wizard-title">{translate("credentialsTitle")}</h2>
      <p className="custodian-wizard__hint">
        {translate("credentialsStayInBrowser")}
      </p>
      <CustodianTextField
        id="custodian-api-key"
        label={translate("apiKeyLabel")}
        value={model.apiKey}
        disabled={model.isSubmitting}
        testId="custodian-api-key"
        onChange={actions.changeApiKey}
      />
      <CustodianPemField
        label={translate("pemLabel")}
        hint={pemHint}
        value={model.pemText}
        disabled={model.isSubmitting}
        onChange={actions.changePem}
      />
      {model.errorMessage && (
        <p
          className="custodian-wizard__error"
          role="alert"
          data-testid="custodian-error"
        >
          {model.errorMessage}
        </p>
      )}
      <CustodianCredentialActions
        isSubmitting={model.isSubmitting}
        onBack={actions.goBack}
      />
    </form>
  );
}
