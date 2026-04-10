import React from "react";
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
};

export function MainLayoutHeader({
  translate,
  setLanguageOpen,
  faucetOpen,
  setFaucetOpen,
  walletOpen,
  setWalletOpen,
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
