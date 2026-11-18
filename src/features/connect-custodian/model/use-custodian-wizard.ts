import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  beginCredentialSubmit,
  changeWizardApiKey,
  changeWizardEnvironment,
  changeWizardPem,
  failCredentialSubmit,
  finishCredentialSubmit,
  selectWizardWallet,
  showFireblocksCredentials,
  showPreviousWizardStep,
} from "./custodian-wizard-actions";
import {
  INITIAL_CUSTODIAN_WIZARD,
  type CustodianWizardActions,
  type CustodianWizardModel,
} from "./custodian-wizard-model";
import { submitCustodianCredentials } from "./submit-custodian-credentials";

export function useCustodianWizard(): {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
} {
  const { t: translate } = useTranslation("custodian");
  const [model, setModel] = useState(INITIAL_CUSTODIAN_WIZARD);
  const actions: CustodianWizardActions = {
    chooseFireblocks: () => {
      showFireblocksCredentials(setModel);
    },
    goBack: () => {
      showPreviousWizardStep(setModel);
    },
    changeApiKey: (value) => {
      changeWizardApiKey(setModel, value);
    },
    changePem: (value) => {
      changeWizardPem(setModel, value);
    },
    changeEnvironment: (environmentId) => {
      changeWizardEnvironment(setModel, environmentId);
    },
    submitCredentials: () => {
      const snapshot = {
        apiKey: model.apiKey,
        pemText: model.pemText,
        environmentId: model.environmentId,
      };
      beginCredentialSubmit(setModel);
      void submitCustodianCredentials(snapshot)
        .then((wallets) => {
          finishCredentialSubmit(setModel, wallets);
        })
        .catch((error: unknown) => {
          failCredentialSubmit({
            setModel,
            error,
            translate: (key, options) =>
              options === undefined ? translate(key) : translate(key, options),
          });
        });
    },
    selectWallet: (walletKey) => {
      selectWizardWallet(setModel, walletKey);
    },
  };
  return { model, actions };
}
