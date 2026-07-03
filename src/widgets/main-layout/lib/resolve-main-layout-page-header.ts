import { isSettingsRoute } from "@/widgets/settings-layout";

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
    match: (pathname) => pathname === "/contacts/new",
    titleKey: "pageTitleAddContact",
    titleNamespace: "contacts",
    backTo: "/contacts",
  },
  {
    match: (pathname) => /^\/contacts\/\d+\/edit$/.test(pathname),
    titleKey: "pageTitleEditContact",
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
    match: (pathname) => pathname === "/about",
    titleKey: "title",
    titleNamespace: "about",
    backTo: "/settings",
  },
  {
    match: (pathname) => pathname === "/privacy-policy",
    titleKey: "title",
    titleNamespace: "privacyPolicy",
    backTo: "/settings",
  },
];

function resolveSettingsPageHeader(): MainLayoutPageHeaderConfig {
  return {
    titleKey: "settings",
    titleNamespace: "navigation",
    showBack: true,
    backTo: "/",
  };
}

export function resolveMainLayoutPageHeader(
  pathname: string,
): MainLayoutPageHeaderConfig {
  if (isSettingsRoute(pathname)) {
    return resolveSettingsPageHeader();
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
