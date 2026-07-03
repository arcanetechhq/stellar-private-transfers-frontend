import React from "react";

interface PolicyListItemProperties {
  marker?: string;
  children: React.ReactNode;
}

export function PolicyListItem({
  marker = "•",
  children,
}: PolicyListItemProperties) {
  return (
    <li className="info-page__list-item">
      <span className="info-page__list-marker">{marker}</span>
      {children}
    </li>
  );
}
