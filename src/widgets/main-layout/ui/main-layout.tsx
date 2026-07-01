import { Outlet } from "react-router";
import { StellarWalletModalProvider } from "@/features/stellar-wallet-connect";
import { MainLayoutHeader } from "./main-layout-header";
import { MainLayoutSidebar } from "./main-layout-sidebar";
import {
  EnsureMissingPrivateAddressScalars,
  PollAllAssetDeliveries,
} from "@/features/poll-coin-deliveries";
import { PollPendingDeposits } from "@/features/poll-deposit";
import { isSettingsRoute, SettingsSidebar } from "@/widgets/settings-layout";
import { useMainLayoutModel } from "../lib/use-main-layout-model";
import { useMainLayoutSidebarState } from "../lib/use-main-layout-sidebar-state";

import "./sidebar.css";
import "./header-faucet.css";

export function MainLayout() {
  const model = useMainLayoutModel();
  const sidebar = useMainLayoutSidebarState();
  const settingsRouteActive = isSettingsRoute(model.location.pathname);

  return (
    <StellarWalletModalProvider>
      <div className="app-shell h-screen">
        <div
          className="app-frame"
          data-sidebar-collapsed={
            settingsRouteActive || sidebar.isNarrowViewport || sidebar.collapsed
              ? "true"
              : undefined
          }
          data-custom-sidebar={settingsRouteActive ? "true" : undefined}
        >
          {settingsRouteActive ? (
            <SettingsSidebar pathname={model.location.pathname} />
          ) : (
            <MainLayoutSidebar
              navigation={model.navigation}
              bottomNavigation={model.bottomNavigation}
              pathname={model.location.pathname}
              translate={model.translate}
              collapsed={sidebar.collapsed}
              isNarrowViewport={sidebar.isNarrowViewport}
              onToggleCollapsed={sidebar.toggleCollapsed}
              onMouseEnter={sidebar.handleSidebarMouseEnter}
              onMouseLeave={sidebar.handleSidebarMouseLeave}
            />
          )}

          <div className="workspace">
            <MainLayoutHeader
              translate={model.translate}
              pageHeader={model.pageHeader}
              languageOpen={model.languageOpen}
              setLanguageOpen={model.setLanguageOpen}
              faucetOpen={model.faucetOpen}
              setFaucetOpen={model.setFaucetOpen}
              notificationsOpen={model.notificationsOpen}
              setNotificationsOpen={model.setNotificationsOpen}
              walletOpen={model.walletOpen}
              setWalletOpen={model.setWalletOpen}
            />

            <main ref={model.mainReference} className="flex-1 overflow-auto">
              <Outlet key={model.location.pathname} />
            </main>
          </div>
        </div>

        <EnsureMissingPrivateAddressScalars />
        <PollAllAssetDeliveries />
        <PollPendingDeposits />
      </div>
    </StellarWalletModalProvider>
  );
}
