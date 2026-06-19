import React from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import Arcn from "@/shared/assets/logo-arcn";
import {
  LOGO_HEIGHT_PX,
  LOGO_WIDTH_PX,
  SIDEBAR_WIDTH_PX,
} from "./main-layout-constants";

export type MainLayoutNavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
};

type MainLayoutSidebarProperties = {
  navigation: MainLayoutNavItem[];
  bottomNavigation: MainLayoutNavItem[];
  pathname: string;
  translate: (key: string) => string;
};

function NavLinkRow({
  item,
  isActive,
}: {
  item: MainLayoutNavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      className="flex items-center gap-3 px-3 transition-colors"
      style={{
        height: "40px",
        borderRadius: "10px",
        backgroundColor: isActive ? "#FFFFFF" : "transparent",
        color: isActive ? "#1B1D22" : "#5E6168",
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: 500,
        boxShadow: isActive ? "0 1px 2px rgba(16, 24, 40, 0.03)" : "none",
      }}
      onMouseEnter={(event) => {
        if (!isActive) event.currentTarget.style.backgroundColor = "#F6F6F4";
      }}
      onMouseLeave={(event) => {
        if (!isActive)
          event.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon
        className="h-4 w-4"
        style={{ color: isActive ? "#1B1D22" : "#9A9DA3" }}
      />
      <span className="flex-1">{item.name}</span>
      {item.badgeCount && item.badgeCount > 0 ? (
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: "#111827", color: "#FFFFFF" }}
        >
          {item.badgeCount}
        </span>
      ) : undefined}
    </Link>
  );
}

export function MainLayoutSidebar({
  navigation,
  bottomNavigation,
  pathname,
  translate,
}: MainLayoutSidebarProperties) {
  return (
    <aside
      className="flex flex-col"
      style={{
        width: `${SIDEBAR_WIDTH_PX}px`,
        backgroundColor: "#F1F1EF",
        borderRight: "1px solid #E5E4DF",
      }}
    >
      <div
        className="border-b px-4"
        style={{
          paddingTop: "24px",
          paddingBottom: "24px",
          borderColor: "#E5E4DF",
        }}
      >
        <div
          style={{ width: `${LOGO_WIDTH_PX}px`, height: `${LOGO_HEIGHT_PX}px` }}
        >
          <Arcn />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLinkRow
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      <div className="space-y-1 p-4" style={{ borderTop: "1px solid #E5E4DF" }}>
        {bottomNavigation.map((item) => (
          <NavLinkRow
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
        <div
          className="mt-3 px-3"
          style={{ fontSize: "11px", lineHeight: "16px", color: "#9A9DA3" }}
        >
          {translate("navigation:appVersion")}
        </div>
      </div>
    </aside>
  );
}
