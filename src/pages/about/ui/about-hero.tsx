import { useTranslation } from "react-i18next";
import Arcn from "@/shared/assets/logo-arcn";

export function AboutHero() {
  const { t: translate } = useTranslation("about");
  return (
    <>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="info-page__logo h-[50px] w-[200px]">
            <Arcn />
          </div>
        </div>
        <div className="mb-6">
          <p className="info-page__text mb-2 font-semibold">{translate("version")}</p>
          <p className="info-page__text-sm">{translate("tagline")}</p>
        </div>
      </div>
      <div className="info-page__panel rounded-lg p-6">
        <p className="info-page__text text-center">{translate("description")}</p>
      </div>
    </>
  );
}
