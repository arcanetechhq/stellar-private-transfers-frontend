import { useEffect, useRef, useState } from "react";

import { SIDEBAR_NARROW_BREAKPOINT_PX } from "../ui/main-layout-constants";

const SIDEBAR_HOVER_COLLAPSE_DELAY_MS = 120;

export function useMainLayoutSidebarState() {
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const collapseTimeoutReference = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(
      `(max-width: ${SIDEBAR_NARROW_BREAKPOINT_PX}px)`,
    );

    const updateViewport = () => {
      setIsNarrowViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isNarrowViewport) {
      setIsHovered(false);
    }
  }, [isNarrowViewport]);

  useEffect(
    () => () => {
      if (collapseTimeoutReference.current) {
        clearTimeout(collapseTimeoutReference.current);
      }
    },
    [],
  );

  const collapsed = isNarrowViewport ? !isHovered : userCollapsed;

  const toggleCollapsed = () => {
    if (isNarrowViewport) {
      return;
    }
    setUserCollapsed((current) => !current);
  };

  const handleSidebarMouseEnter = () => {
    if (!isNarrowViewport) {
      return;
    }

    if (collapseTimeoutReference.current) {
      clearTimeout(collapseTimeoutReference.current);
      collapseTimeoutReference.current = undefined;
    }

    setIsHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    if (!isNarrowViewport) {
      return;
    }

    if (collapseTimeoutReference.current) {
      clearTimeout(collapseTimeoutReference.current);
    }

    collapseTimeoutReference.current = setTimeout(() => {
      setIsHovered(false);
      collapseTimeoutReference.current = undefined;
    }, SIDEBAR_HOVER_COLLAPSE_DELAY_MS);
  };

  return {
    collapsed,
    isNarrowViewport,
    toggleCollapsed,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
  };
}
