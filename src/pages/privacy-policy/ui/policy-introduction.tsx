import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

export function PolicyIntroduction() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("introduction.title")} />
      <p className="info-page__text">{translate("introduction.content")}</p>
    </div>
  );
}
