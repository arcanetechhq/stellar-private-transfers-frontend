import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";
import { PolicyListItem } from "./policy-list-item";

export function PolicyDataUsage() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("dataUsage.title")} />
      <ul className="space-y-2">
        <PolicyListItem>{translate("dataUsage.item1")}</PolicyListItem>
        <PolicyListItem>{translate("dataUsage.item2")}</PolicyListItem>
        <PolicyListItem>{translate("dataUsage.item3")}</PolicyListItem>
        <PolicyListItem>{translate("dataUsage.item4")}</PolicyListItem>
        <PolicyListItem>{translate("dataUsage.item5")}</PolicyListItem>
      </ul>
    </div>
  );
}
