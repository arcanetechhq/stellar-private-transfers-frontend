import React from "react";
import { Outlet, useLocation } from "react-router";
import { FileText, HelpCircle, History, Home, Info, Users } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { i18n } from "@/shared/config/i18n-instance";
import { MainLayoutHeader } from "./main-layout-header";
import { MainLayoutSidebar } from "./main-layout-sidebar";
import { NotificationsModal } from "./notifications-modal";
import {
  EnsureMissingStealthScalars,
  PollAllAssetDeliveries,
} from "@/features/poll-coin-deliveries";
import { PollPendingDeposits } from "@/features/poll-deposit";

export function MainLayout() {
  const { t: translate } = useTranslation(["navigation", "common"]);
  const location = useLocation();
  const mainReference = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    mainReference.current?.scrollTo(0, 0);
  }, [location.pathname, location.search, location.key]);

  const navigation = useMemo(
    () => [
      { name: translate("navigation:home"), icon: Home, href: "/" },
      {
        name: translate("navigation:history"),
        icon: History,
        href: "/history",
      },
      {
        name: translate("navigation:contacts"),
        icon: Users,
        href: "/contacts",
      },
    ],
    [translate],
  );

  const bottomNavigation = useMemo(
    () => [
      { name: translate("navigation:about"), icon: Info, href: "/about" },
      { name: translate("navigation:help"), icon: HelpCircle, href: "/help" },
      {
        name: translate("navigation:privacyPolicy"),
        icon: FileText,
        href: "/privacy-policy",
      },
    ],
    [translate],
  );

  const [languageOpen, setLanguageOpen] = useState(false);
  const [faucetOpen, setFaucetOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language ?? "en");

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLanguage(code);
    setLanguageOpen(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F4F4F2" }}>
      <MainLayoutSidebar
        navigation={navigation}
        bottomNavigation={bottomNavigation}
        pathname={location.pathname}
        translate={translate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MainLayoutHeader
          translate={translate}
          languageOpen={languageOpen}
          setLanguageOpen={setLanguageOpen}
          faucetOpen={faucetOpen}
          setFaucetOpen={setFaucetOpen}
          walletOpen={walletOpen}
          setWalletOpen={setWalletOpen}
          onOpenNotifications={() => setNotificationsOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleLanguageChange}
        />

        <main ref={mainReference} className="flex-1 overflow-auto">
          <Outlet key={`${location.pathname}:${location.key}`} />
        </main>
      </div>

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <EnsureMissingStealthScalars />
      <PollAllAssetDeliveries />
      <PollPendingDeposits />
    </div>
  );
}
