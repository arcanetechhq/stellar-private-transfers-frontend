import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import {
  ArrowLeftRight,
  Bolt,
  Home,
  LogIn,
  UserCircleIcon,
} from "lucide-react";
import { disconnectStellarWallet } from "@/features/stellar-wallet-connect";
import { i18n } from "@/shared/config/i18n-instance";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { MainLayoutNavItem } from "../ui/main-layout-sidebar";
import { resolveMainLayoutPageHeader } from "./resolve-main-layout-page-header";

export function useMainLayoutModel() {
  const { t: translate } = useTranslation(["navigation", "common"]);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const mainReference = useRef<HTMLElement>(null);
  const publicKey = useAppSelector(selectWalletPublicKey);

  const pageHeader = useMemo(
    () => resolveMainLayoutPageHeader(location.pathname),
    [location.pathname],
  );

  useLayoutEffect(() => {
    mainReference.current?.scrollTo(0, 0);
  }, [location.pathname, location.search, location.key]);

  const navigation = useMemo(
    (): MainLayoutNavItem[] => [
      { name: translate("navigation:home"), icon: Home, href: "/" },
      {
        name: translate("navigation:transactions"),
        icon: ArrowLeftRight,
        href: "/transactions",
      },
      {
        name: translate("navigation:contacts"),
        icon: UserCircleIcon,
        href: "/contacts",
      },
    ],
    [translate],
  );

  const bottomNavigation = useMemo((): MainLayoutNavItem[] => {
    const items: MainLayoutNavItem[] = [
      {
        name: translate("navigation:settings"),
        icon: Bolt,
        href: "/settings",
      },
    ];

    if (publicKey) {
      items.push({
        name: translate("navigation:logOut"),
        icon: LogIn,
        onClick: () => {
          void dispatch(disconnectStellarWallet());
        },
      });
    }

    return items;
  }, [dispatch, publicKey, translate]);

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
    pageHeader,
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
