import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, MailCheck } from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import {
  NOTIFICATION_GENERAL_ROWS,
  NOTIFICATION_IMPORTANT_ROWS,
} from "@/widgets/settings-layout";
import {
  SettingsChip,
  SettingsListRow,
  SettingsRouteFrame,
  SettingsSection,
} from "@/widgets/settings-layout";

type NotificationChannel = "email" | "push";

type NotificationPreference = {
  email: boolean;
  push: boolean;
};

function buildInitialPreferences() {
  return Object.fromEntries(
    [...NOTIFICATION_IMPORTANT_ROWS, ...NOTIFICATION_GENERAL_ROWS].map(
      (row) => [row.titleKey, { email: row.email, push: row.push }],
    ),
  ) as Record<string, NotificationPreference>;
}

export function SettingsNotifications() {
  const { t: translate } = useTranslation("settings");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState(
    buildInitialPreferences,
  );

  function getPreference(titleKey: string, row: NotificationPreference) {
    return notificationPreferences[titleKey] ?? row;
  }

  function togglePreference(titleKey: string, channel: NotificationChannel) {
    setNotificationPreferences((preferences) => {
      const current = preferences[titleKey];

      return {
        ...preferences,
        [titleKey]: {
          ...current,
          [channel]: !current[channel],
        },
      };
    });
  }

  function renderNotificationChip(
    titleKey: string,
    row: NotificationPreference,
    channel: NotificationChannel,
    Icon: typeof MailCheck,
    label: string,
  ) {
    const preference = getPreference(titleKey, row);
    const active = preference[channel];

    return (
      <SettingsChip
        icon={Icon}
        tone={active ? "success" : "default"}
        active={active}
        ariaLabel={`${translate(titleKey)} ${label}`}
        onClick={() => togglePreference(titleKey, channel)}
      >
        {label}
      </SettingsChip>
    );
  }

  return (
    <SettingsRouteFrame stacked>
      <SettingsSection title={translate("notifications.push.title")}>
        <div className="settings-panel-card">
          <SettingsListRow
            icon={Bell}
            title={translate("notifications.push.title")}
            text={translate("notifications.push.text")}
            action={
              <Switch
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
                aria-label={translate("notifications.push.title")}
              />
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection title={translate("notifications.importantUpdates")}>
        <div className="settings-panel-card">
          {NOTIFICATION_IMPORTANT_ROWS.map((row) => (
            <SettingsListRow
              icon={row.icon}
              title={translate(row.titleKey)}
              text={translate(row.textKey)}
              key={row.titleKey}
            >
              {renderNotificationChip(
                row.titleKey,
                row,
                "email",
                MailCheck,
                translate("notifications.email"),
              )}
              {renderNotificationChip(
                row.titleKey,
                row,
                "push",
                Bell,
                translate("notifications.pushLabel"),
              )}
            </SettingsListRow>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title={translate("notifications.generalUpdates")}>
        <div className="settings-panel-card">
          {NOTIFICATION_GENERAL_ROWS.map((row) => (
            <SettingsListRow
              title={translate(row.titleKey)}
              text={translate(row.textKey)}
              key={row.titleKey}
            >
              {renderNotificationChip(
                row.titleKey,
                row,
                "email",
                MailCheck,
                translate("notifications.email"),
              )}
              {renderNotificationChip(
                row.titleKey,
                row,
                "push",
                Bell,
                translate("notifications.pushLabel"),
              )}
            </SettingsListRow>
          ))}
        </div>
      </SettingsSection>
    </SettingsRouteFrame>
  );
}
