import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

export function PolicyDataCollection() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div>
      <PolicySectionHeading title={translate("dataCollection.title")} />
      <div className="space-y-4">
        <div>
          <h3 className="info-page__subheading mb-2">
            {translate("dataCollection.walletInfo")}
          </h3>
          <p className="info-page__text">
            {translate("dataCollection.walletInfoContent")}
          </p>
        </div>
        <div>
          <h3 className="info-page__subheading mb-2">
            {translate("dataCollection.transactionData")}
          </h3>
          <p className="info-page__text">
            {translate("dataCollection.transactionDataContent")}
          </p>
        </div>
        <div>
          <h3 className="info-page__subheading mb-2">
            {translate("dataCollection.usageData")}
          </h3>
          <p className="info-page__text">
            {translate("dataCollection.usageDataContent")}
          </p>
        </div>
      </div>
    </div>
  );
}
