import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackAction } from "@/shared/ui/header-back-action";
import { PageTitleText } from "@/shared/ui/page-title-text";

export function PageHeader() {
  const { t: translate } = useTranslation("allAssets");
  return (
    <div className="mb-6">
      <HeaderBackAction to="/" label={translate("backToHome")} />
      <PageTitleText
        title={translate("pageTitle")}
        subtitle={translate("pageSubtitle")}
      />
    </div>
  );
}
