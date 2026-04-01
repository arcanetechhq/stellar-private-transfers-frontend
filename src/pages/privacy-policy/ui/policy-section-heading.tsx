import React from "react";

interface PolicySectionHeadingProperties {
  title: string;
}

export function PolicySectionHeading({
  title,
}: PolicySectionHeadingProperties) {
  return (
    <h2
      className="mb-3 font-semibold"
      style={{
        fontSize: "20px",
        lineHeight: "28px",
        color: "#121826",
      }}
    >
      {title}
    </h2>
  );
}
