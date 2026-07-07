import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { FileText, HelpCircle, History, Home, Inbox, Info, Users } from "lucide-react";
import { i18n } from "@/shared/config/i18n-instance";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useSdkPendingClaimsCount } from "@/entities/pending-claims";
import type { MainLayoutNavItem } from "./main-layout-navigation";

export function useMainLayoutModel() {
  const { t: translate } = useTranslation(["navigation", "common"]);
  const location = useLocation();
  const mainReference = useRef<HTMLElement>(null);
  const publicKey = useAppSelector(selectWalletPublicKey);
  const pendingClaimsBadgeCount = useSdkPendingClaimsCount(publicKey ?? undefined);

  useLayoutEffect(() => {
    mainReference.current?.scrollTo(0, 0);
  }, [location.pathname, location.search, location.key]);

  const navigation = useMemo(
    (): MainLayoutNavItem[] => [
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
      {
        name: translate("navigation:pendingClaims"),
        icon: Inbox,
        href: "/pending-claims",
        badgeCount: pendingClaimsBadgeCount,
      },
    ],
    [translate, pendingClaimsBadgeCount],
  );

  const bottomNavigation = useMemo(
    (): MainLayoutNavItem[] => [
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

  return {
    translate,
    location,
    mainReference,
    navigation,
    bottomNavigation,
    languageOpen,
    setLanguageOpen,
    faucetOpen,
    setFaucetOpen,
    walletOpen,
    setWalletOpen,
    notificationsOpen,
    setNotificationsOpen,
    currentLanguage,
    handleLanguageChange,
  };
}
