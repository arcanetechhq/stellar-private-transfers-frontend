import React from "react";
import { useTranslation } from "react-i18next";

export function AboutFooter() {
  const { t: translate } = useTranslation("about");
  return (
    <div>
      <h2 className="info-page__section-title mb-4">{translate("contactSupport")}</h2>
      <p className="info-page__text">
        {translate("contactDescription")}{" "}
        <a
          href="mailto:support@arcn.io"
          className="info-page__link font-semibold underline"
        >
          support@arcn.io
        </a>
      </p>
    </div>
  );
}
