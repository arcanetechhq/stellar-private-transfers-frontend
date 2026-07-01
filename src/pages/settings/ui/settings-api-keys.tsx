import { useTranslation } from "react-i18next";
import { Code2, FileText, Plus } from "lucide-react";
import {
  SettingsCardHeader,
  SettingsIconFrame,
  SettingsRouteFrame,
  SettingsSection,
  SettingsTable,
} from "@/widgets/settings-layout";

type ApiKeyTableRow = {
  id: string;
  name: string;
  created: string;
  lastUsed: string;
  access: string;
};

export function SettingsApiKeys() {
  const { t: translate } = useTranslation("settings");

  return (
    <SettingsRouteFrame stacked>
      <SettingsSection
        title={translate("apiKeys.title")}
        text={translate("apiKeys.description")}
      >
        <div className="settings-panel-card">
          <SettingsCardHeader
            icon={Code2}
            title={translate("apiKeys.title")}
            text={translate("apiKeys.securityNote")}
            action={
              <button className="settings-primary-button" type="button">
                <Plus size={16} strokeWidth={1.5} />
                {translate("apiKeys.create")}
              </button>
            }
          />
          <SettingsTable<ApiKeyTableRow>
            columns={[
              {
                key: "name",
                title: translate("apiKeys.columns.name"),
                width: "minmax(0, 1.2fr)",
              },
              {
                key: "created",
                title: translate("apiKeys.columns.created"),
              },
              {
                key: "lastUsed",
                title: translate("apiKeys.columns.lastUsed"),
              },
              {
                key: "access",
                title: translate("apiKeys.columns.access"),
              },
            ]}
            rows={[]}
            rowKey={(row) => row.id}
          />
        </div>
      </SettingsSection>

      <SettingsSection title={translate("apiKeys.resources.title")}>
        <div className="settings-mini-grid">
          <div className="settings-resource-card" data-interactive="true">
            <SettingsIconFrame icon={FileText} />
            <div className="settings-list-row__title">
              {translate("apiKeys.resources.documentation")}
            </div>
            <div className="settings-list-row__text">
              {translate("apiKeys.resources.documentationHint")}
            </div>
          </div>
          <div className="settings-resource-card">
            <SettingsIconFrame icon={Code2} />
            <div className="settings-list-row__title">
              {translate("apiKeys.resources.latestVersion")}
            </div>
            <div className="settings-list-row__text">
              {translate("apiKeys.resources.versionValue")}
            </div>
          </div>
        </div>
      </SettingsSection>
    </SettingsRouteFrame>
  );
}
