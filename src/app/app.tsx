import { RouterProvider } from "react-router/dom";
import { I18nProvider } from "./providers/i18n-provider";
import { StoreProvider } from "./providers/store-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { PrivacySdkProvider } from "./providers/privacy-sdk-provider";
import { WalletPrivateAddressProvider } from "@/features/register-private-address";
import { router } from "./routes";

import "@/shared/lib/stellar-wallet-kit";

function AppShell() {
  return <RouterProvider router={router} unstable_useTransitions={false} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <PrivacySdkProvider>
          <WalletPrivateAddressProvider>
            <I18nProvider>
              <AppShell />
            </I18nProvider>
          </WalletPrivateAddressProvider>
        </PrivacySdkProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
