import {
  getActiveSettingsItemId,
  isSettingsRoute,
  SETTINGS_NAV_GROUPS,
} from "@/widgets/settings-layout";

export type MainLayoutPageHeaderConfig = {
  titleKey: string;
  titleNamespace: string;
  showBack: boolean;
  backTo: string | undefined;
};

type RouteRule = {
  match: (pathname: string) => boolean;
  titleKey: string;
  titleNamespace: string;
  backTo?: string;
};

const ROUTE_RULES: RouteRule[] = [
  {
    match: (pathname) => pathname === "/assets",
    titleKey: "pageTitle",
    titleNamespace: "allAssets",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/create-transfer",
    titleKey: "pageTitle",
    titleNamespace: "transfer",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/deposit",
    titleKey: "pageTitle",
    titleNamespace: "deposit",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/withdraw",
    titleKey: "pageTitle",
    titleNamespace: "withdrawal",
    backTo: "/",
  },
  {
    match: (pathname) => pathname.startsWith("/transfer-success/"),
    titleKey: "pageTitle",
    titleNamespace: "deposit",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/transactions",
    titleKey: "title",
    titleNamespace: "transactions",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/history",
    titleKey: "title",
    titleNamespace: "transactions",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/contacts/new",
    titleKey: "pageTitleAddContact",
    titleNamespace: "contacts",
    backTo: "/contacts",
  },
  {
    match: (pathname) => pathname === "/contacts",
    titleKey: "title",
    titleNamespace: "contacts",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/pending-claims",
    titleKey: "title",
    titleNamespace: "pending-claims",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/help",
    titleKey: "title",
    titleNamespace: "help",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/about",
    titleKey: "title",
    titleNamespace: "about",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/privacy-policy",
    titleKey: "title",
    titleNamespace: "privacyPolicy",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/access",
    titleKey: "title",
    titleNamespace: "access",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/confirmations",
    titleKey: "pageTitle",
    titleNamespace: "confirmations",
    backTo: "/",
  },
  {
    match: (pathname) => pathname === "/disclosure",
    titleKey: "pageTitle",
    titleNamespace: "disclosure",
    backTo: "/",
  },
];

function resolveSettingsPageHeader(pathname: string): MainLayoutPageHeaderConfig {
  const activeItemId = getActiveSettingsItemId(pathname);
  const activeItem = SETTINGS_NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => item.id === activeItemId,
  );

  return {
    titleKey: activeItem?.labelKey ?? "nav.general",
    titleNamespace: "settings",
    showBack: false,
    backTo: undefined,
  };
}

export function resolveMainLayoutPageHeader(
  pathname: string,
): MainLayoutPageHeaderConfig {
  if (isSettingsRoute(pathname)) {
    return resolveSettingsPageHeader(pathname);
  }

  if (pathname === "/") {
    return {
      titleKey: "home",
      titleNamespace: "navigation",
      showBack: false,
      backTo: undefined,
    };
  }

  const matchedRule = ROUTE_RULES.find((rule) => rule.match(pathname));
  if (matchedRule) {
    return {
      titleKey: matchedRule.titleKey,
      titleNamespace: matchedRule.titleNamespace,
      showBack: true,
      backTo: matchedRule.backTo,
    };
  }

  return {
    titleKey: "notFound.title",
    titleNamespace: "common",
    showBack: true,
    backTo: "/",
  };
}
