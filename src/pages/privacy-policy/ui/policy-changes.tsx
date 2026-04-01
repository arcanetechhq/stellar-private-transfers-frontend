import React from "react";
import { useTranslation } from "react-i18next";
import { PolicySectionHeading } from "./policy-section-heading";

const textStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#667085",
};

export function PolicyChanges() {
  const { t: translate } = useTranslation("privacyPolicy");
  return (
    <>
      <div>
        <PolicySectionHeading title={translate("changes.title")} />
        <p style={textStyle}>
          {translate("changes.content")}
        </p>
      </div>
      <div>
        <PolicySectionHeading title={translate("contact.title")} />
        <p style={textStyle}>
          {translate("contact.content")}{" "}
          <a
            href="mailto:privacy@arcn.io"
            style={{
              color: "#111827",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            privacy@arcn.io
          </a>
        </p>
      </div>
    </>
  );
}
