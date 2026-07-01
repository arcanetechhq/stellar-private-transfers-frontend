import {
  AtSign,
  Check,
  Copy,
  LogOut,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useTheme } from "next-themes";
import { useWalletProviderLabel } from "@/entities/wallet";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { useCopy } from "@/shared/hooks";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";

const THEME_OPTIONS = [
  { value: "system", labelKey: "accountMenuThemeSystem", icon: Monitor },
  { value: "dark", labelKey: "accountMenuThemeNight", icon: Moon },
  { value: "light", labelKey: "accountMenuThemeDay", icon: Sun },
] as const;

type ThemeMode = (typeof THEME_OPTIONS)[number]["value"];

const NICKNAME_STORAGE_KEY = "arcane-user-nickname-v1";

function loadNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function formatUserId(value: string): string {
  const normalized = value.trim().replace(/^@+/, "");
  return normalized ? `@${normalized}` : "";
}

type ConnectedWalletPanelProperties = {
  isOpen: boolean;
  publicKey: string;
  onClose: () => void;
  onManageWallet: () => void;
  onChangeWallet: () => void;
  onDisconnect: () => void | Promise<void>;
};

function WalletUserIdSection({ onClose }: { onClose: () => void }) {
  const { t: translate } = useTranslation(["common", "settings"]);
  const nickname = loadNickname();
  const userId = formatUserId(nickname);
  const { copied, handleCopy } = useCopy(userId);

  if (userId) {
    return (
      <div className="account-menu__identity" aria-label={translate("common:userIdLabel")}>
        <span className="account-menu__identity-icon" aria-hidden="true">
          <AtSign size={18} strokeWidth={1.7} />
        </span>
        <span className="account-menu__identity-copy">
          <small>{translate("common:userIdLabel")}</small>
          <span>{userId}</span>
        </span>
        <button
          type="button"
          className="account-menu__copy"
          aria-label={translate("common:copyUserId")}
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={18} strokeWidth={1.8} />
          ) : (
            <Copy size={18} strokeWidth={1.6} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className="account-menu__identity account-menu__identity--empty"
      aria-label={translate("common:userIdLabel")}
    >
      <span className="account-menu__identity-icon" aria-hidden="true">
        <AtSign size={18} strokeWidth={1.7} />
      </span>
      <span className="account-menu__identity-copy">
        <small>{translate("common:userIdLabel")}</small>
        <span>{translate("common:userIdNotSet")}</span>
      </span>
      <Link
        to="/settings/general"
        className="account-menu__set-id"
        onClick={onClose}
      >
        {translate("common:setUserId")}
      </Link>
    </div>
  );
}

export function ConnectedWalletPanel({
  isOpen,
  publicKey,
  onClose,
  onManageWallet,
  onChangeWallet,
  onDisconnect,
}: ConnectedWalletPanelProperties) {
  const { t: translate } = useTranslation(["common", "settings"]);
  const { theme, setTheme } = useTheme();
  const providerLabel = useWalletProviderLabel();
  const activeTheme = (theme ?? "system") as ThemeMode;

  if (!isOpen) {
    return;
  }

  return (
    <div
      className="account-menu__popover"
      role="menu"
      aria-label={translate("common:accountMenuLabel")}
    >
      <div
        className="account-menu__theme-switch"
        role="group"
        aria-label={translate("settings:appearance.title")}
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <button
              type="button"
              data-active={activeTheme === option.value}
              key={option.value}
              onClick={() => setTheme(option.value)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{translate(`common:${option.labelKey}`)}</span>
            </button>
          );
        })}
      </div>

      {!HIDDEN_FEATURES.userId ? <WalletUserIdSection onClose={onClose} /> : null}

      <button
        type="button"
        className="account-menu__item account-menu__wallet"
        role="menuitem"
        onClick={onManageWallet}
      >
        <Wallet size={24} strokeWidth={1.5} />
        <span className="account-menu__item-copy">
          <span>{shortenStellarAddress(publicKey, 4, 3)}</span>
          <small>
            {translate("common:walletProviderWallet", {
              provider: providerLabel,
            })}
          </small>
        </span>
      </button>

      <button
        type="button"
        className="account-menu__item"
        role="menuitem"
        onClick={onChangeWallet}
      >
        <RefreshCw size={24} strokeWidth={1.5} />
        <span>{translate("common:changeWallet")}</span>
      </button>

      <button
        type="button"
        className="account-menu__item"
        role="menuitem"
        onClick={() => {
          onClose();
          void onDisconnect();
        }}
      >
        <LogOut size={24} strokeWidth={1.5} />
        <span>{translate("common:logout")}</span>
      </button>
    </div>
  );
}
