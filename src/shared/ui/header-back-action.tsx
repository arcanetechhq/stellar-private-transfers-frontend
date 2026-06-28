import React from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const BACK_ACTION_STYLE = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#667085",
  border: "1px solid #E7EAF0",
  backgroundColor: "#FFFFFF",
};

function applyHoverBackground(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.backgroundColor = "#F6F7F9";
}

function applyDefaultBackground(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.backgroundColor = "#FFFFFF";
}

type HeaderBackActionProperties = {
  label: string;
  to?: string;
  onClick?: () => void;
  className?: string;
};

export function HeaderBackAction({
  label,
  to,
  onClick,
  className = "mb-4 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
}: HeaderBackActionProperties) {
  const content = (
    <>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        style={BACK_ACTION_STYLE}
        onMouseEnter={applyHoverBackground}
        onMouseLeave={applyDefaultBackground}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={BACK_ACTION_STYLE}
      onMouseEnter={applyHoverBackground}
      onMouseLeave={applyDefaultBackground}
    >
      {content}
    </button>
  );
}
