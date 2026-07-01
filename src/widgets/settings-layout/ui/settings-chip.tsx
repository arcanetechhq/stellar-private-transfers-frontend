import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SettingsChipProperties = {
  icon?: LucideIcon;
  children: ReactNode;
  tone?: "default" | "success";
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

export function SettingsChip({
  icon: Icon,
  children,
  tone = "default",
  active = true,
  onClick,
  ariaLabel,
}: SettingsChipProperties) {
  const content = (
    <>
      {Icon ? <Icon size={13} strokeWidth={1.6} /> : undefined}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="settings-chip"
        data-tone={tone}
        data-active={active}
        aria-label={ariaLabel}
        aria-pressed={active}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className="settings-chip" data-tone={tone} data-active={active}>
      {content}
    </span>
  );
}
