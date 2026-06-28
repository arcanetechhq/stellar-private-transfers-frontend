import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderBackAction } from "@/shared/ui/header-back-action";
import { PageTitleText } from "@/shared/ui/page-title-text";

interface PageHeaderProperties {
  onBack: () => void;
}

export function PageHeader(properties: PageHeaderProperties) {
  const { onBack } = properties;
  const { t: translate } = useTranslation("deposit");

  return (
    <div className="mb-6">
      <HeaderBackAction onClick={onBack} label={translate("backToHome")} />
      <PageTitleText
        title={translate("pageTitle")}
        subtitle={translate("pageSubtitle")}
      />
    </div>
  );
}
