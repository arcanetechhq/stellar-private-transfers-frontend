import React from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "@/shared/ui/page-heading";

export function HistoryHeader() {
  const { t: translate } = useTranslation("history");

  return (
    <PageHeading
      title={translate("title")}
      subtitle={translate("subtitle")}
    />
  );
}
