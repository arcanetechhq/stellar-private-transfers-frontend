import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

const textStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#667085",
};

export function PolicyIntroduction() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("introduction.title")} />
      <p style={textStyle}>
        {translate("introduction.content")}
      </p>
    </div>
  );
}
