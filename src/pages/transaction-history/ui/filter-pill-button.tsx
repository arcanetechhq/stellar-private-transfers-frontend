import React from "react";

interface FilterPillButtonProperties {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function FilterPillButton(properties: FilterPillButtonProperties) {
  const { label, isActive, onClick } = properties;

  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2.5 transition-colors"
      style={{
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: 600,
        backgroundColor: isActive ? "#111827" : "#FFFFFF",
        color: isActive ? "#FFFFFF" : "#667085",
        border: isActive ? "none" : "1px solid #E7EAF0",
      }}
      onMouseEnter={(event) => {
        if (!isActive) event.currentTarget.style.backgroundColor = "#F6F7F9";
      }}
      onMouseLeave={(event) => {
        if (!isActive) event.currentTarget.style.backgroundColor = "#FFFFFF";
      }}
    >
      {label}
    </button>
  );
}
