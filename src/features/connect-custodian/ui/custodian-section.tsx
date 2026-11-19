import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { subscribeCustodianResumeFailure } from "../model/custodian-resume-failure";
import { CustodianWizard } from "./custodian-wizard";
import "./custodian-wizard.css";

export function CustodianConnectSection() {
  const { t: translate } = useTranslation("custodian");
  const [isOpen, setIsOpen] = useState(false);
  const [resumeError, setResumeError] = useState<unknown>();
  useEffect(
    () =>
      subscribeCustodianResumeFailure((error) => {
        setResumeError(error);
        setIsOpen(true);
      }),
    [],
  );

  return (
    <section
      className="custodian-section"
      aria-label={translate("sectionTitle")}
      data-testid="custodian-section"
    >
      <p className="custodian-section__label">{translate("sectionTitle")}</p>
      <button
        type="button"
        className="custodian-section__action"
        data-testid="custodian-open"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {translate("sectionAction")}
      </button>
      {isOpen
        ? createPortal(
            <CustodianWizard
              resumeError={resumeError}
              onClose={() => {
                setIsOpen(false);
              }}
            />,
            document.body,
          )
        : undefined}
    </section>
  );
}
