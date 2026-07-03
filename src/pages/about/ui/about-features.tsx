import React from "react";
import { useTranslation } from "react-i18next";

const FEATURE_KEYS = ["feature1", "feature2", "feature3", "feature4", "feature5"] as const;

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="info-page__feature-item relative pl-6">
      <span className="info-page__feature-marker absolute left-0 font-semibold">*</span>
      {text}
    </li>
  );
}

export function AboutFeatures() {
  const { t: translate } = useTranslation("about");

  return (
    <div>
      <h2 className="info-page__section-title mb-4">{translate("keyFeatures")}</h2>
      <div className="info-page__panel rounded-lg p-6">
        <ul className="space-y-3">
          {FEATURE_KEYS.map((key) => (
            <FeatureItem key={key} text={translate(key)} />
          ))}
        </ul>
      </div>
    </div>
  );
}
