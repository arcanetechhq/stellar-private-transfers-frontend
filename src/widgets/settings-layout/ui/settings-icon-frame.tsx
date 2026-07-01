import type { LucideIcon } from "lucide-react";

type SettingsIconFrameProperties = {
  icon: LucideIcon;
};

export function SettingsIconFrame({ icon: Icon }: SettingsIconFrameProperties) {
  return (
    <span className="settings-icon-frame" aria-hidden="true">
      <Icon size={17} strokeWidth={1.5} />
    </span>
  );
}
