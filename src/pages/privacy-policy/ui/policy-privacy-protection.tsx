import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";
import { PolicyListItem } from "./policy-list-item";

export function PolicyPrivacyProtection() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("privacyProtection.title")} />
      <p className="info-page__text mb-4">{translate("privacyProtection.intro")}</p>
      <div className="info-page__panel rounded-lg">
        <ul className="space-y-2">
          <PolicyListItem marker="✓">
            {translate("privacyProtection.item1")}
          </PolicyListItem>
          <PolicyListItem marker="✓">
            {translate("privacyProtection.item2")}
          </PolicyListItem>
          <PolicyListItem marker="✓">
            {translate("privacyProtection.item3")}
          </PolicyListItem>
          <PolicyListItem marker="✓">
            {translate("privacyProtection.item4")}
          </PolicyListItem>
        </ul>
      </div>
    </div>
  );
}
