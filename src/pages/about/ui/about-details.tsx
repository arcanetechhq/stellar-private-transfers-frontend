import React from "react";
import { useTranslation } from "react-i18next";

interface DetailRowProperties {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProperties) {
  return (
    <div
      className="flex items-center justify-between border-b py-3"
      style={{ borderColor: "#E7EAF0" }}
    >
      <span
        style={{
          fontSize: "15px",
          lineHeight: "20px",
          color: "#98A2B3",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "15px",
          lineHeight: "20px",
          color: "#121826",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function AboutDetails() {
  const { t: translate } = useTranslation("about");

  const technicalDetails: DetailRowProperties[] = [
    { label: translate("network"), value: translate("ethereumMainnet") },
    { label: translate("protocol"), value: translate("zeroKnowledgeProofs") },
    { label: translate("license"), value: translate("mit") },
  ];

  return (
    <div>
      <h2
        className="mb-4 font-semibold"
        style={{
          fontSize: "20px",
          lineHeight: "28px",
          color: "#121826",
        }}
      >
        {translate("technicalDetails")}
      </h2>
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
