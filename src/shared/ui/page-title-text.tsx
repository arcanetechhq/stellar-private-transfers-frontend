import React from "react";

type PageTitleTextProperties = {
  title: string;
  subtitle: string;
};

export function PageTitleText({ title, subtitle }: PageTitleTextProperties) {
  return (
    <>
      <h1
        className="font-semibold"
        style={{ fontSize: "32px", lineHeight: "40px", color: "#121826" }}
      >
        {title}
      </h1>
      <p
        className="mt-1"
        style={{ fontSize: "16px", lineHeight: "24px", color: "#667085" }}
      >
        {subtitle}
      </p>
    </>
  );
}
