"use client";

import * as React from "react";

import { useIsMobile } from "./use-mobile";
import { cn } from "@/shared/lib/cn";
import {
  SidebarContext,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  useSidebar,
  type SidebarContextProperties,
} from "./sidebar-shell";
import {
  MobileSidebar,
  NonCollapsibleSidebar,
  SidebarDesktop,
} from "./sidebar-shell";
import { TooltipProvider } from "./tooltip";

function SidebarProvider({
  defaultOpen = true,
  open: openProperty,
  onOpenChange: setOpenProperty,
  className,
  style,
  children,
  ...properties
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProperty ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProperty) setOpenProperty(openState);
      else _setOpen(openState);
      localStorage.setItem(SIDEBAR_COOKIE_NAME, String(openState));
    },
    [setOpenProperty, open],
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const contextValue = React.useMemo<SidebarContextProperties>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );
  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...properties}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...properties
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state } = useSidebar();
  if (collapsible === "none") {
    return (
      <NonCollapsibleSidebar className={className} {...properties}>
        {children}
      </NonCollapsibleSidebar>
    );
  }
  if (isMobile) {
    return (
      <MobileSidebar side={side} {...properties}>
        {children}
      </MobileSidebar>
    );
  }
  return (
    <SidebarDesktop
      side={side}
      variant={variant}
      collapsible={collapsible}
      state={state}
      className={className}
      {...properties}
    >
      {children}
    </SidebarDesktop>
  );
}

export { Sidebar, SidebarProvider };
export { useSidebar } from "./sidebar-shell";
export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar-layout";
export {
  sidebarMenuButtonVariants,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./sidebar-menu";
