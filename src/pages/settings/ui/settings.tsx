import React from "react";
import { useTranslation } from "react-i18next";
import { WalletCard } from "./wallet-card";
import { AboutSection } from "./about-section";

export function Settings() {
  const { t: translate } = useTranslation("settings");

  return (
    <div className="p-8" style={{ backgroundColor: "#F6F7F9" }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1
            className="font-semibold"
            style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}
          >
            {translate("title")}
          </h1>
          <p
            className="mt-1"
            style={{ fontSize: "16px", lineHeight: "24px", color: "#667085" }}
          >
            {translate("subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <WalletCard />
          <AboutSection />
        </div>
      </div>
    </div>
  );
}
