import React from "react";
import { useTranslation } from "react-i18next";

export function AboutSection() {
  const { t: translate } = useTranslation("settings");

  return (
    <div
      className="rounded-xl bg-white p-4"
      style={{ border: "1px solid #E7EAF0" }}
    >
      <h2
        className="mb-3 font-semibold"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#121826" }}
      >
        {translate("about")}
      </h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}
          >
            {translate("appVersion")}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              color: "#121826",
              fontWeight: 500,
            }}
          >
            {translate("version")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span
            style={{ fontSize: "13px", lineHeight: "18px", color: "#667085" }}
          >
            {translate("network")}
          </span>
          <span
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              color: "#121826",
              fontWeight: 500,
            }}
          >
            {translate("ethereumMainnet")}
          </span>
        </div>
      </div>
    </div>
  );
}
