import React from "react";
import { useTranslation } from "react-i18next";

type CustodianChoiceStepProperties = {
  onChooseFireblocks: () => void;
};

export function CustodianChoiceStep(properties: CustodianChoiceStepProperties) {
  const { t: translate } = useTranslation("custodian");

  return (
    <div className="custodian-wizard__step">
      <h2 id="custodian-wizard-title">{translate("choiceTitle")}</h2>
      <button
        type="button"
        className="custodian-choice"
        data-testid="custodian-choice-fireblocks"
        onClick={properties.onChooseFireblocks}
      >
        <span className="custodian-choice__name">
          {translate("choiceFireblocks")}
        </span>
        <span className="custodian-choice__description">
          {translate("choiceFireblocksDescription")}
        </span>
      </button>
    </div>
  );
}
