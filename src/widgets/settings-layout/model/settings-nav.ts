import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Code2,
  Gift,
  Settings as SettingsIcon,
} from "lucide-react";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";

export type SettingsNavItemId =
  | "general"
  | "notifications"
  | "api-keys"
  | "referral-program";

export type SettingsNavItem = {
  id: SettingsNavItemId;
  labelKey: string;
  href: string;
  icon: LucideIcon;
};

export type SettingsNavGroup = {
  sectionKey: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    sectionKey: "nav.personal",
    items: [
      {
        id: "general",
        labelKey: "nav.general",
        href: "/settings/general",
        icon: SettingsIcon,
      },
      {
        id: "notifications",
        labelKey: "nav.notifications",
        href: "/settings/notifications",
        icon: Bell,
      },
    ],
  },
  {
    sectionKey: "nav.workspace",
    items: [
      {
        id: "api-keys",
        labelKey: "nav.apiKeys",
        href: "/settings/api-keys",
        icon: Code2,
      },
      ...(HIDDEN_FEATURES.settingsReferralProgram
        ? []
        : [
            {
              id: "referral-program" as const,
              labelKey: "nav.referralProgram",
              href: "/settings/referral-program",
              icon: Gift,
            },
          ]),
    ],
  },
];

export function getActiveSettingsItemId(pathname: string): SettingsNavItemId {
  const normalizedPath = pathname.replace(/\/$/, "");

  for (const group of SETTINGS_NAV_GROUPS) {
    for (const item of group.items) {
      if (normalizedPath === item.href) {
        return item.id;
      }
    }
  }

  return "general";
}

export function isSettingsRoute(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}
