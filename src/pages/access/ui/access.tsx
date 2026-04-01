import React from "react";
import { useTranslation } from "react-i18next";

export function Access() {
  const { t: translate } = useTranslation("access");
  return (
    <div className="space-y-4">
      <h1 className="text-foreground text-2xl font-semibold">
        {translate("title")}
      </h1>
      <p className="text-muted-foreground text-sm">{translate("description")}</p>
    </div>
  );
}
