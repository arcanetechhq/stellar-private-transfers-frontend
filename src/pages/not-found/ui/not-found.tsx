import React from "react";
import { useTranslation } from "react-i18next";

export function NotFound() {
  const { t: translate } = useTranslation("common");
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{translate("notFound.title")}</h1>
    </div>
  );
}
