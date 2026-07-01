import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { PanelLeft } from "lucide-react";
import Arcn, { type ArcnVariant } from "@/shared/assets/logo-arcn";

export type MainLayoutNavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
};

type MainLayoutSidebarProperties = {
  navigation: MainLayoutNavItem[];
  bottomNavigation: MainLayoutNavItem[];
  pathname: string;
  translate: (key: string) => string;
  collapsed: boolean;
  isNarrowViewport: boolean;
  onToggleCollapsed: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function SidebarBadge({ value }: { value?: number }) {
  if (!value || value <= 0) {
    return undefined;
  }

  return <span className="sidebar-link__badge">{value}</span>;
}

function isSidebarItemActive(pathname: string, item: MainLayoutNavItem) {
  if (!item.href) {
    return false;
  }

  if (item.href === "/settings") {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }

  return pathname === item.href;
}

function SidebarLink({
  item,
  isActive,
  collapsed,
}: {
  item: MainLayoutNavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const title = collapsed ? item.name : undefined;
  const content = (
    <>
      <span className="sidebar-link__icon">
        <Icon size={20} strokeWidth={1.5} />
      </span>
      <span>{item.name}</span>
      <SidebarBadge value={item.badgeCount} />
    </>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        className="sidebar-link"
        data-active={isActive}
        onClick={item.onClick}
        title={title}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={item.href ?? "/"}
      className="sidebar-link"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      title={title}
    >
      {content}
    </Link>
  );
}

function SidebarHeaderSection({
  collapsed,
  isNarrowViewport,
  translate,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  isNarrowViewport: boolean;
  translate: (key: string) => string;
  onToggleCollapsed: () => void;
}) {
  const showLogo = !collapsed || isNarrowViewport;
  const logoVariant: ArcnVariant = collapsed && isNarrowViewport ? "mark" : "full";

  return (
    <div className="sidebar__account">
      {showLogo ? (
        <Link
          to="/"
          className={
            logoVariant === "mark"
              ? "sidebar__brand sidebar__brand--mark"
              : "sidebar__brand"
          }
          aria-label={translate("navigation:home")}
        >
          <div
            className={
              logoVariant === "mark"
                ? "sidebar__brand-logo sidebar__brand-logo--mark"
                : "sidebar__brand-logo"
            }
          >
            <Arcn variant={logoVariant} />
          </div>
        </Link>
      ) : undefined}
      <button
        type="button"
        className="sidebar__panel-control"
        aria-label={
          collapsed
            ? translate("navigation:expandSidebar")
            : translate("navigation:collapseSidebar")
        }
        aria-pressed={collapsed}
        onClick={onToggleCollapsed}
        title={
          collapsed
            ? translate("navigation:expandSidebar")
            : translate("navigation:collapseSidebar")
        }
      >
        <PanelLeft size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function MainLayoutSidebar({
  navigation,
  bottomNavigation,
  pathname,
  translate,
  collapsed,
  isNarrowViewport,
  onToggleCollapsed,
  onMouseEnter,
  onMouseLeave,
}: MainLayoutSidebarProperties) {
  return (
    <div className="sidebar-slot">
      <aside
        className="sidebar"
        data-collapsed={collapsed}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <SidebarHeaderSection
          collapsed={collapsed}
          isNarrowViewport={isNarrowViewport}
          translate={translate}
          onToggleCollapsed={onToggleCollapsed}
        />

        <div className="sidebar__nav">
          <div className="sidebar__nav-main">
            <nav className="sidebar__section">
              {navigation.map((item) => (
                <SidebarLink
                  key={item.href ?? item.name}
                  item={item}
                  isActive={isSidebarItemActive(pathname, item)}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>

          <nav className="sidebar__section sidebar__footer">
            {bottomNavigation.map((item) => (
              <SidebarLink
                key={item.href ?? item.name}
                item={item}
                isActive={isSidebarItemActive(pathname, item)}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
