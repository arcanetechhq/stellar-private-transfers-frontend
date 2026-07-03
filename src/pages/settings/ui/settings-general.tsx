import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  AtSign,
  ChevronRight,
  Eye,
  FileText,
  Info,
  ReceiptText,
} from "lucide-react";
import {
  SettingsIconFrame,
  SettingsRouteFrame,
  SettingsSection,
} from "@/widgets/settings-layout";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";

const THEME_MODES = ["system", "light", "dark"] as const;

type ThemeMode = (typeof THEME_MODES)[number];

function getThemeModeLabel(
  mode: ThemeMode,
  resolvedTheme: string | undefined,
  translate: (key: string, options?: Record<string, string>) => string,
): string {
  if (mode === "system") {
    return translate("appearance.systemValue", {
      theme: resolvedTheme ?? "dark",
    });
  }

  return translate(`appearance.${mode}`);
}

function SettingsIdentitySection({
  translate,
}: {
  translate: (key: string) => string;
}) {
  const [nickname, setNickname] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const normalizedNickname = nicknameDraft.trim().replace(/^@+/, "");
  const isNicknameValid = normalizedNickname.length > 0;
  const isNicknameChanged = normalizedNickname !== nickname;

  useEffect(() => {
    setNicknameDraft(nickname);
  }, [nickname]);

  function handleNicknameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isNicknameValid || !isNicknameChanged) {
      return;
    }

    setNickname(normalizedNickname);
  }

  return (
    <SettingsSection title={translate("identity.title")}>
      <form className="settings-identity-card" onSubmit={handleNicknameSubmit}>
        <SettingsIconFrame icon={AtSign} />
        <div className="flex flex-col gap-1">
          <div className="settings-appearance-card__title">
            {translate("identity.nickname")}
          </div>
          <div className="settings-appearance-card__text">
            {translate("identity.nicknameHint")}
          </div>
        </div>
        <label className="settings-identity-field">
          <span aria-hidden="true">@</span>
          <input
            aria-label={translate("identity.nickname")}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck="false"
            value={nicknameDraft}
            onChange={(event) =>
              setNicknameDraft(event.target.value.replace(/\s+/g, ""))
            }
            placeholder={translate("identity.nicknamePlaceholder")}
          />
        </label>
        <button className="settings-identity-save-button" type="submit">
          {translate("identity.save")}
        </button>
      </form>
    </SettingsSection>
  );
}

export function SettingsGeneral() {
  const { t: translate } = useTranslation("settings");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const activeTheme = (theme ?? "system") as ThemeMode;

  return (
    <SettingsRouteFrame>
      <SettingsSection title={translate("appearance.title")}>
        <div className="settings-appearance-card">
          <SettingsIconFrame icon={Eye} />
          <span>
            <div className="settings-appearance-card__title">
              {translate("appearance.title")}
            </div>
            <div className="settings-appearance-card__text">
              {getThemeModeLabel(activeTheme, resolvedTheme, translate)}
            </div>
          </span>
          <div className="appearance-switch">
            {THEME_MODES.map((mode) => (
              <button
                type="button"
                data-active={mode === activeTheme}
                key={mode}
                onClick={() => setTheme(mode)}
              >
                {translate(`appearance.${mode}`)}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {!HIDDEN_FEATURES.userId ? (
        <SettingsIdentitySection translate={translate} />
      ) : null}

      <SettingsSection title={translate("moreOptions.title")}>
        <div className="settings-options-card">
          <Link className="settings-option-row" to="/about">
            <SettingsIconFrame icon={Info} />
            <span className="settings-list-row__title">
              {translate("moreOptions.about")}
            </span>
            <ChevronRight size={18} strokeWidth={1.5} />
          </Link>
          <Link className="settings-option-row" to="/privacy-policy">
            <SettingsIconFrame icon={FileText} />
            <span className="settings-list-row__title">
              {translate("moreOptions.privacyPolicy")}
            </span>
            <ChevronRight size={18} strokeWidth={1.5} />
          </Link>
          {!HIDDEN_FEATURES.termsOfService ? (
            <div
              className="settings-option-row settings-option-row--disabled"
              aria-disabled="true"
            >
              <SettingsIconFrame icon={ReceiptText} />
              <span className="settings-list-row__title">
                {translate("moreOptions.termsOfService")}
              </span>
              <ChevronRight size={18} strokeWidth={1.5} />
            </div>
          ) : null}
        </div>
      </SettingsSection>
    </SettingsRouteFrame>
  );
}
