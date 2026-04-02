import React from "react";
import { RouterProvider } from "react-router";
import "@/shared/lib/stellar-wallet-kit";
import { StellarProvider } from "@/shared/stellar/stellar-provider";
import { I18nProvider } from "./providers/i18n-provider";
import { StoreProvider } from "./providers/store-provider";
import { router } from "./routes";

export default function App() {
  return (
    <StoreProvider>
      <I18nProvider>
        <StellarProvider>
          <RouterProvider router={router} />
        </StellarProvider>
      </I18nProvider>
    </StoreProvider>
  );
}
