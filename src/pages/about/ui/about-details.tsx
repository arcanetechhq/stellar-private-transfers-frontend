import React from "react";
import { useTranslation } from "react-i18next";

interface DetailRowProperties {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProperties) {
  return (
    <div className="info-page__divider flex items-center justify-between border-b py-3">
      <span className="info-page__text-sm">{label}</span>
      <span className="info-page__text font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}

export function AboutDetails() {
  const { t: translate } = useTranslation("about");

  const technicalDetails: DetailRowProperties[] = [
    { label: translate("network"), value: translate("stellarTestnet") },
    { label: translate("protocol"), value: translate("zeroKnowledgeProofs") },
    { label: translate("license"), value: translate("mit") },
  ];

  return (
    <div>
      <h2 className="info-page__section-title mb-4">{translate("technicalDetails")}</h2>
      <div className="space-y-4">
        {technicalDetails.map((detail) => (
          <DetailRow
            key={detail.label}
            label={detail.label}
            value={detail.value}
          />
        ))}
      </div>
    </div>
  );
}
