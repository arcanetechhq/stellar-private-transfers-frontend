import { useTranslation } from "react-i18next";
import { Copy, Gift, Globe2, ShieldCheck, UserPlus, Users } from "lucide-react";
import {
  SettingsIconFrame,
  SettingsListRow,
  SettingsRouteFrame,
  SettingsSection,
  SettingsTable,
} from "@/widgets/settings-layout";

type ReferralTableRow = {
  id: string;
  name: string;
  status: string;
  reward: string;
};

export function SettingsReferralProgram() {
  const { t: translate } = useTranslation("settings");

  return (
    <SettingsRouteFrame stacked>
      <SettingsSection
        title={translate("referral.title")}
        text={translate("referral.description")}
      >
        <div className="settings-metric-grid">
          <div className="settings-metric-card">
            <SettingsIconFrame icon={Gift} />
            <div className="settings-metric-card__label">
              {translate("referral.metrics.availableReward")}
            </div>
            <div className="settings-metric-card__value">$0.00</div>
          </div>
          <div className="settings-metric-card">
            <SettingsIconFrame icon={Users} />
            <div className="settings-metric-card__label">
              {translate("referral.metrics.invitedUsers")}
            </div>
            <div className="settings-metric-card__value">0</div>
          </div>
          <div className="settings-metric-card">
            <SettingsIconFrame icon={ShieldCheck} />
            <div className="settings-metric-card__label">
              {translate("referral.metrics.paidRewards")}
            </div>
            <div className="settings-metric-card__value">$0.00</div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={translate("referral.inviteLink.title")}>
        <div className="settings-panel-card">
          <SettingsListRow
            icon={UserPlus}
            title={translate("referral.inviteLink.codeTitle")}
            text={translate("referral.emptyValue")}
            action={
              <button className="settings-icon-action" type="button" disabled>
                <Copy size={16} strokeWidth={1.6} />
                {translate("referral.copy")}
              </button>
            }
          />
          <SettingsListRow
            icon={Globe2}
            title={translate("referral.inviteLink.linkTitle")}
            text={translate("referral.emptyValue")}
            action={
              <button className="settings-icon-action" type="button" disabled>
                <Copy size={16} strokeWidth={1.6} />
                {translate("referral.copy")}
              </button>
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection title={translate("referral.invitedUsers")}>
        <SettingsTable<ReferralTableRow>
          columns={[
            {
              key: "name",
              title: translate("referral.columns.name"),
              width: "minmax(0, 1.2fr)",
            },
            {
              key: "status",
              title: translate("referral.columns.status"),
            },
            {
              key: "reward",
              title: translate("referral.columns.reward"),
            },
          ]}
          rows={[]}
          rowKey={(row) => row.id}
        />
      </SettingsSection>
    </SettingsRouteFrame>
  );
}
