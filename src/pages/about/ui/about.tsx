import React from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { AboutHero } from "./about-hero";
import { AboutDetails } from "./about-details";
import { AboutFeatures } from "./about-features";
import { AboutFooter } from "./about-footer";

export function About() {
  const { t: translate } = useTranslation("about");
  return (
    <div className="p-8" style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#F9FAFB", border: "1px solid #E7EAF0" }}
            >
              <Info className="h-6 w-6" style={{ color: "#667085" }} />
            </div>
            <div>
              <h1
                className="mb-1 font-semibold"
                style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}
              >
                {translate("title")}
              </h1>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl bg-white p-8"
          style={{ border: "1px solid #E7EAF0" }}
        >
          <div className="space-y-8">
            <AboutHero />
            <AboutDetails />
            <AboutFeatures />
            <AboutFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
