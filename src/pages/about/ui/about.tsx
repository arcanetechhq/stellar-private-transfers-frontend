import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { AboutHero } from "./about-hero";
import { AboutDetails } from "./about-details";
import { AboutFeatures } from "./about-features";
import { AboutFooter } from "./about-footer";
import "@/shared/styles/info-page.css";

export function About() {
  const { t: translate } = useTranslation("about");
  return (
    <div className="info-page">
      <div className="info-page__shell">
        <div className="info-page__header">
          <div className="info-page__header-row">
            <div className="info-page__icon-wrap">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h1 className="info-page__title">{translate("title")}</h1>
            </div>
          </div>
        </div>
        <div className="info-page__card">
          <div className="info-page__stack">
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
