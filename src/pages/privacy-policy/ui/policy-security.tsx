import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

const textStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#667085",
};

export function PolicySecurity() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <>
      <div>
        <PolicySectionHeading title={translate("security.title")} />
        <p style={textStyle}>
          {translate("security.content")}
        </p>
      </div>
      <div>
        <PolicySectionHeading title={translate("thirdParty.title")} />
        <p style={textStyle}>
          {translate("thirdParty.content")}
        </p>
      </div>
    </>
  );
}
