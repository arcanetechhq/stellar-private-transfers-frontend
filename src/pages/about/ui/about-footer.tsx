import React from "react";
import { useTranslation } from "react-i18next";

export function AboutFooter() {
  const { t: translate } = useTranslation("about");
  return (
    <div>
      <h2
        className="mb-4 font-semibold"
        style={{
          fontSize: "20px",
          lineHeight: "28px",
          color: "#121826",
        }}
      >
        {translate("contactSupport")}
      </h2>
      <p
        style={{
          fontSize: "15px",
          lineHeight: "24px",
          color: "#667085",
        }}
      >
        {translate("contactDescription")}{" "}
        <a
          href="mailto:support@arcn.io"
          style={{
            color: "#111827",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          support@arcn.io
        </a>
      </p>
    </div>
  );
}
