import React from "react";

type StatusVariant =
  | "success"
  | "pending"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface StatusBadgeProperties {
  children: React.ReactNode;
  variant?: StatusVariant;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string }> = {
  success: { bg: "#ECFDF3", text: "#027A48" },
  pending: { bg: "#FFF7ED", text: "#C2410C" },
  warning: { bg: "#FFF7ED", text: "#C2410C" },
  error: { bg: "#FEF2F2", text: "#B42318" },
  info: { bg: "#EEF4FF", text: "#1D4ED8" },
  neutral: { bg: "#F3F4F6", text: "#4B5563" },
};

export function StatusBadge({
  children,
  variant = "neutral",
}: StatusBadgeProperties) {
  const styles = variantStyles[variant];

  return (
    <span
      className="inline-flex items-center px-2.5 font-semibold"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderRadius: "999px",
        height: "24px",
        fontSize: "12px",
        lineHeight: "16px",
      }}
    >
      {children}
    </span>
  );
}
