import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const THEME_STORAGE_KEY = "arc-ui-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
