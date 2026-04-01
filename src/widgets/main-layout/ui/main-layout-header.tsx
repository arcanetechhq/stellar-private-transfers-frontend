import React from "react";
import { Bell, Globe, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useStellarWalletConnection } from "@/features/stellar-wallet-connect";
import { MainLayoutHeaderWallet } from "./main-layout-header-wallet";
import { MainLayoutLanguageMenu } from "./main-layout-language-menu";

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
  walletOpen: boolean;
  setWalletOpen: (open: boolean) => void;
  onOpenNotifications: () => void;
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
};

function MainLayoutSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative max-w-md flex-1">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-300/50 focus:outline-none"
      />
    </div>
  );
}

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
      {withBadge && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
    </button>
  );
}

export function MainLayoutHeader({
  translate,
  languageOpen,
  setLanguageOpen,
  walletOpen,
  setWalletOpen,
  onOpenNotifications,
  currentLanguage,
  onSelectLanguage,
}: MainLayoutHeaderProperties) {
  const wallet = useStellarWalletConnection();

  return (
    <React.Fragment>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-4">
            <MainLayoutSearch placeholder={translate("common:searchPlaceholder")} />
          </div>

          <div className="flex items-center gap-4">
            <MainLayoutIconButton
              onClick={onOpenNotifications}
              icon={<Bell className="h-5 w-5" />}
              withBadge
            />

            <div className="relative">
              <MainLayoutIconButton
                onClick={() => setLanguageOpen(!languageOpen)}
                icon={<Globe className="h-5 w-5" />}
                isExpanded={languageOpen}
              />
              <MainLayoutLanguageMenu
                isOpen={languageOpen}
                onClose={() => setLanguageOpen(false)}
                languages={[...LANGUAGES]}
                currentLanguage={currentLanguage}
                onSelectLanguage={onSelectLanguage}
              />
            </div>

            <MainLayoutHeaderWallet
              translate={translate}
              wallet={wallet}
              walletOpen={walletOpen}
              setWalletOpen={setWalletOpen}
            />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}
