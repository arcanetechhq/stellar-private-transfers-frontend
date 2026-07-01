import { Link } from "react-router";
import "./settings.css";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getActiveSettingsItemId,
  SETTINGS_NAV_GROUPS,
} from "../model/settings-nav";

type SettingsSidebarProperties = {
  pathname: string;
};

export function SettingsSidebar({ pathname }: SettingsSidebarProperties) {
  const { t: translate } = useTranslation("settings");
  const activeItemId = getActiveSettingsItemId(pathname);

  return (
    <aside className="settings-sidebar">
      <Link to="/" className="settings-nav-link">
        <ArrowLeft size={18} strokeWidth={1.5} />
        {translate("backToApp")}
      </Link>

      {SETTINGS_NAV_GROUPS.map((group) => (
        <div className="settings-nav-group" key={group.sectionKey}>
          <div className="settings-nav-group__title">
            {translate(group.sectionKey)}
          </div>
          {group.items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.href}
                className="settings-nav-link"
                data-active={activeItemId === item.id}
                aria-current={activeItemId === item.id ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.5} />
                {translate(item.labelKey)}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
