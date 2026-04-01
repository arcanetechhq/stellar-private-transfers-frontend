import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

const textStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#667085",
};

const subheadingStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#344054",
};

export function PolicyDataCollection() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("dataCollection.title")} />
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold" style={subheadingStyle}>
            {translate("dataCollection.walletInfo")}
          </h3>
          <p style={textStyle}>
            {translate("dataCollection.walletInfoContent")}
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold" style={subheadingStyle}>
            {translate("dataCollection.transactionData")}
          </h3>
          <p style={textStyle}>
            {translate("dataCollection.transactionDataContent")}
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold" style={subheadingStyle}>
            {translate("dataCollection.usageData")}
          </h3>
          <p style={textStyle}>
            {translate("dataCollection.usageDataContent")}
          </p>
        </div>
      </div>
    </div>
  );
}
