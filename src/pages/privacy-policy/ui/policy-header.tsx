import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

export function PolicyHeader() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <div className="info-page__header">
      <div className="info-page__header-row">
        <div className="info-page__icon-wrap">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="info-page__title">{translate("title")}</h1>
        </div>
      </div>
      <p className="info-page__subtitle">{translate("lastUpdated")}</p>
    </div>
  );
}
