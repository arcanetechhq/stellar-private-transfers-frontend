import React from "react";
import type { ReactNode } from "react";
import { MainLayoutHeaderWallet } from "./main-layout-header-wallet";
import { HeaderFaucetMenu } from "./header-faucet-menu";

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
] as const;

type MainLayoutHeaderProperties = {
  translate: (key: string) => string;
  languageOpen: boolean;
  setLanguageOpen: (open: boolean) => void;
  faucetOpen: boolean;
  setFaucetOpen: (open: boolean) => void;
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  onOpenNotifications: () => void;
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
};

type MainLayoutIconButtonProperties = {
  onClick: () => void;
  icon: ReactNode;
  withBadge?: boolean;
  isExpanded?: boolean;
};

function MainLayoutIconButton({
  onClick,
  icon,
  withBadge = false,
  isExpanded,
}: MainLayoutIconButtonProperties) {
  return (
    <button
      type="button"
      className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
      onClick={onClick}
      aria-expanded={isExpanded}
    >
      {icon}
      {withBadge && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}

export function MainLayoutHeader({
  translate,
  languageOpen,
  setLanguageOpen,
  faucetOpen,
  setFaucetOpen,
  walletOpen,
  setWalletOpen,
  onOpenNotifications,
  currentLanguage,
  onSelectLanguage,
}: MainLayoutHeaderProperties) {
  return (
    <React.Fragment>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex min-h-[50px] items-center justify-between">
          <div className="flex flex-1 items-center gap-4"></div>

          <div className="flex items-center gap-4">
            <HeaderFaucetMenu
              isOpen={faucetOpen}
              onOpenChange={(open) => {
                setFaucetOpen(open);
                if (open) {
                  setLanguageOpen(false);
                }
              }}
            />

            <MainLayoutHeaderWallet
              translate={translate}
              walletOpen={walletOpen}
              setWalletOpen={setWalletOpen}
            />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}
