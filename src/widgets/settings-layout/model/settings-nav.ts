export function isSettingsRoute(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export function isNoSidebarRoute(pathname: string): boolean {
  return (
    isSettingsRoute(pathname) ||
    pathname === "/about" ||
    pathname === "/privacy-policy"
  );
}
