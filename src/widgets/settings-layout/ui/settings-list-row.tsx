import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SettingsIconFrame } from "./settings-icon-frame";

type SettingsListRowProperties = {
  icon?: LucideIcon;
  title: string;
  text?: string;
  meta?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function SettingsListRow({
  icon,
  title,
  text,
  meta,
  action,
  children,
}: SettingsListRowProperties) {
  return (
    <div className="settings-list-row">
      {icon ? <SettingsIconFrame icon={icon} /> : undefined}
      <div className="flex flex-col gap-1">
        <div className="settings-list-row__title">{title}</div>
        {text ? <div className="settings-list-row__text">{text}</div> : undefined}
      </div>
      {children ? (
        <div className="settings-list-row__content">{children}</div>
      ) : undefined}
      {meta ? <span className="settings-list-row__meta">{meta}</span> : undefined}
      {action ? <div className="settings-list-row__action">{action}</div> : undefined}
    </div>
  );
}
