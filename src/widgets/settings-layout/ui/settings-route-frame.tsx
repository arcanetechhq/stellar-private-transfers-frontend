import type { ReactNode } from "react";

type SettingsRouteFrameProperties = {
  children: ReactNode;
  stacked?: boolean;
};

export function SettingsRouteFrame({
  children,
  stacked = false,
}: SettingsRouteFrameProperties) {
  return (
    <div className="workspace__inner">
      <div className="settings-route">
        <section
          className={`settings-route__content${stacked ? " settings-route__content--stack" : ""}`}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
