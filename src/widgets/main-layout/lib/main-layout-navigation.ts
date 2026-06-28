import type { LucideIcon } from "lucide-react";

export type MainLayoutNavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
};
