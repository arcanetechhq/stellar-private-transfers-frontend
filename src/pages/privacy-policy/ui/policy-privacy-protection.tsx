import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";
import { PolicyListItem } from "./policy-list-item";

export function PolicyPrivacyProtection() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("privacyProtection.title")} />
      <p
        className="mb-4"
        style={{
          fontSize: "15px",
          lineHeight: "24px",
          color: "#667085",
        }}
      >
        {translate("privacyProtection.intro")}
      </p>
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E7EAF0",
        }}
      >
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
