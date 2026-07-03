import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";
import { PolicyListItem } from "./policy-list-item";

export function PolicyRights() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("rights.title")} />
      <p className="info-page__text mb-3">{translate("rights.intro")}</p>
      <ul className="space-y-2">
        <PolicyListItem>{translate("rights.item1")}</PolicyListItem>
        <PolicyListItem>{translate("rights.item2")}</PolicyListItem>
        <PolicyListItem>{translate("rights.item3")}</PolicyListItem>
        <PolicyListItem>{translate("rights.item4")}</PolicyListItem>
        <PolicyListItem>{translate("rights.item5")}</PolicyListItem>
      </ul>
    </div>
  );
}
