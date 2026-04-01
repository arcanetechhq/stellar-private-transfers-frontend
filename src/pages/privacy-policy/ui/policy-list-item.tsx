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
    <li
      style={{
        fontSize: "15px",
        lineHeight: "24px",
        color: "#667085",
        paddingLeft: "20px",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "0",
          color: "#111827",
        }}
      >
        {marker}
      </span>
      {children}
    </li>
  );
}
