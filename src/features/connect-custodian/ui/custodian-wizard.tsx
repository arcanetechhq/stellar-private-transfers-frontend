import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  CustodianWizardActions,
  CustodianWizardModel,
} from "../model/custodian-wizard-model";
import { useCustodianWizard } from "../model/use-custodian-wizard";
import { CustodianChoiceStep } from "./custodian-choice-step";
import { CustodianCredentialsStep } from "./custodian-credentials-step";
import { CustodianWalletsStep } from "./custodian-wallets-step";

type CustodianWizardProperties = {
  onClose: () => void;
};

function useCloseOnEscape(onClose: () => void): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);
}

function CustodianWizardBody(properties: {
  model: CustodianWizardModel;
  actions: CustodianWizardActions;
}) {
  const { model, actions } = properties;
  if (model.step === "choice") {
    return <CustodianChoiceStep onChooseFireblocks={actions.chooseFireblocks} />;
  }
  if (model.step === "credentials") {
    return <CustodianCredentialsStep model={model} actions={actions} />;
  }
  return <CustodianWalletsStep model={model} actions={actions} />;
}

function closeFromBackdrop(
  event: { target: EventTarget; currentTarget: EventTarget },
  onClose: () => void,
): void {
  if (event.target === event.currentTarget) {
    onClose();
  }
}

export function CustodianWizard(properties: CustodianWizardProperties) {
  const { t: translate } = useTranslation("custodian");
  const wizard = useCustodianWizard(properties.onClose);
  useCloseOnEscape(properties.onClose);

  return (
    <div
      className="custodian-wizard"
      data-testid="custodian-wizard"
      onMouseDown={(event) => {
        closeFromBackdrop(event, properties.onClose);
      }}
    >
      <div
        className="custodian-wizard__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custodian-wizard-title"
      >
        <button
          type="button"
          className="custodian-wizard__close"
          onClick={properties.onClose}
        >
          {translate("close")}
        </button>
        <CustodianWizardBody model={wizard.model} actions={wizard.actions} />
      </div>
    </div>
  );
}
