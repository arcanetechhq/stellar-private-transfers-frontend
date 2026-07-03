import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

export function PolicySecurity() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <>
      <div>
        <PolicySectionHeading title={translate("security.title")} />
        <p className="info-page__text">{translate("security.content")}</p>
      </div>
      <div>
        <PolicySectionHeading title={translate("thirdParty.title")} />
        <p className="info-page__text">{translate("thirdParty.content")}</p>
      </div>
    </>
  );
}
