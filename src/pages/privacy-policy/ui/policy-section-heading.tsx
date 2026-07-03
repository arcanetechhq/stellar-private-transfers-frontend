import React from "react";

interface PolicySectionHeadingProperties {
  title: string;
}

export function PolicySectionHeading({
  title,
}: PolicySectionHeadingProperties) {
  return <h2 className="info-page__section-title">{title}</h2>;
}
