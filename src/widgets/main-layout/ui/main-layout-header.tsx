import { HeaderFaucetMenu } from "./header-faucet-menu";
import { HeaderNotificationsMenu } from "./header-notifications-menu";
import { HeaderReferralButton } from "./header-referral-button";
import { MainLayoutHeaderWallet } from "./main-layout-header-wallet";
import { MainLayoutPageTitle } from "./main-layout-page-title";
import type { MainLayoutPageHeaderConfig } from "../lib/resolve-main-layout-page-header";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
] as const;

type MainLayoutHeaderProperties = {
  translate: (key: string) => string;
  pageHeader: MainLayoutPageHeaderConfig;
  languageOpen: boolean;
  setLanguageOpen: (open: boolean) => void;
  faucetOpen: boolean;
  setFaucetOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
};

export function MainLayoutHeader({
  translate,
  pageHeader,
  setLanguageOpen,
  faucetOpen,
  setFaucetOpen,
  notificationsOpen,
  setNotificationsOpen,
  walletOpen,
  setWalletOpen: setWalletOpenState,
}: MainLayoutHeaderProperties) {
  const closeSiblingMenus = (
    except: "faucet" | "notifications" | "wallet" | null,
  ) => {
    if (except !== "faucet") {
      setFaucetOpen(false);
    }
    if (except !== "notifications") {
      setNotificationsOpen(false);
    }
    if (except !== "wallet") {
      setWalletOpenState(false);
    }
    if (except !== null) {
      setLanguageOpen(false);
    }
  };

  return (
    <header className="page-header">
      <MainLayoutPageTitle pageHeader={pageHeader} />

      <div className="top-bar">
        <div className="top-bar__actions">
          {!HIDDEN_FEATURES.overviewReferralButton ? <HeaderReferralButton /> : null}

          <HeaderFaucetMenu
            isOpen={faucetOpen}
            onOpenChange={(open) => {
              if (open) {
                closeSiblingMenus("faucet");
              }
              setFaucetOpen(open);
            }}
          />

          <HeaderNotificationsMenu
            isOpen={notificationsOpen}
            onOpenChange={(open) => {
              if (open) {
                closeSiblingMenus("notifications");
              }
              setNotificationsOpen(open);
            }}
          />

          <MainLayoutHeaderWallet
            translate={translate}
            walletOpen={walletOpen}
            setWalletOpen={(open) => {
              if (open) {
                closeSiblingMenus("wallet");
              }
              setWalletOpenState(open);
            }}
          />
        </div>
      </div>
    </header>
  );
}
