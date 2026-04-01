import React from "react";
import { useTranslation } from "react-i18next";
import Arcn from "@/shared/assets/logo-arcn";

export function AboutHero() {
  const { t: translate } = useTranslation("about");
  return (
    <>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div style={{ width: "200px", height: "50px" }}>
            <Arcn />
          </div>
        </div>
        <div className="mb-6">
          <p
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#667085",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            {translate("version")}
          </p>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              color: "#98A2B3",
            }}
          >
            {translate("tagline")}
          </p>
        </div>
      </div>
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E7EAF0",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            lineHeight: "24px",
            color: "#667085",
            textAlign: "center",
          }}
        >
          {translate("description")}
        </p>
      </div>
    </>
  );
}
