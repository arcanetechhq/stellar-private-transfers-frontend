import type { ReactNode } from "react";

type SettingsSectionProperties = {
  title: string;
  text?: string;
  children: ReactNode;
};

export function SettingsSection({
  title,
  text,
  children,
}: SettingsSectionProperties) {
  return (
    <div className="settings-section">
      <div className="settings-section__heading">
        <h2 className="settings-section__title">{title}</h2>
        {text ? <p className="settings-section__text">{text}</p> : undefined}
      </div>
      {children}
    </div>
  );
}
