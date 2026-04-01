import React from "react";
import { useTranslation } from "react-i18next";

const FEATURE_KEYS = ["feature1", "feature2", "feature3", "feature4", "feature5"] as const;

const FEATURE_ITEM_STYLE: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#667085",
  paddingLeft: "24px",
  position: "relative",
};

const FEATURE_BULLET_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "0",
  color: "#10B981",
  fontWeight: 600,
};

function FeatureItem({ text }: { text: string }) {
  return (
    <li style={FEATURE_ITEM_STYLE}>
      <span style={FEATURE_BULLET_STYLE}>*</span>
      {text}
    </li>
  );
}

export function AboutFeatures() {
  const { t: translate } = useTranslation("about");

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
        {translate("keyFeatures")}
      </h2>
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E7EAF0",
        }}
      >
        <ul className="space-y-3">
          {FEATURE_KEYS.map((key) => (
            <FeatureItem key={key} text={translate(key)} />
          ))}
        </ul>
      </div>
    </div>
  );
}
