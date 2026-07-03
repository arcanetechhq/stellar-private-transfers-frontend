import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

export function PolicyChanges() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <>
      <div>
        <PolicySectionHeading title={translate("changes.title")} />
        <p className="info-page__text">{translate("changes.content")}</p>
      </div>
      <div>
        <PolicySectionHeading title={translate("contact.title")} />
        <p className="info-page__text">
          {translate("contact.content")}{" "}
          <a
            href="mailto:privacy@arcn.io"
            className="info-page__link font-semibold underline"
          >
            privacy@arcn.io
          </a>
        </p>
      </div>
    </>
  );
}
