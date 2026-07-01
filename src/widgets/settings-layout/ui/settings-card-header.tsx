import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SettingsIconFrame } from "./settings-icon-frame";

type SettingsCardHeaderProperties = {
  icon?: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
};

export function SettingsCardHeader({
  icon,
  title,
  text,
  action,
}: SettingsCardHeaderProperties) {
  return (
    <div className="settings-card-header">
      {icon ? <SettingsIconFrame icon={icon} /> : undefined}
      <div className="flex flex-col gap-1">
        <div className="settings-list-row__title">{title}</div>
        {text ? <div className="settings-list-row__text">{text}</div> : undefined}
      </div>
      {action ? <div className="settings-card-header__action">{action}</div> : undefined}
    </div>
  );
}
