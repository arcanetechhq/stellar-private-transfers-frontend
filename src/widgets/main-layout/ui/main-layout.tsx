import { Outlet } from "react-router";
import "./sidebar.css";
import "./header-faucet.css";
import { useAppSelector } from "@/store";
import {
  selectIsWalletConnected,
  selectIsWalletKitLoaded,
} from "@/entities/wallet";
import { StellarWalletModalProvider } from "@/features/stellar-wallet-connect";
import { WalletOnboardingProvider, useWalletOnboarding } from "@/features/wallet-onboarding";
import { ConnectWalletScreen } from "@/widgets/connect-wallet-guard";
import { MainLayoutHeader } from "./main-layout-header";
import { MainLayoutSidebar } from "./main-layout-sidebar";
import {
  EnsureMissingPrivateAddressScalars,
  PollAllAssetDeliveries,
} from "@/features/poll-coin-deliveries";
import { PollPendingDeposits } from "@/features/poll-deposit";
import { isNoSidebarRoute } from "@/widgets/settings-layout";
import { useMainLayoutModel } from "../lib/use-main-layout-model";
import { useMainLayoutSidebarState } from "../lib/use-main-layout-sidebar-state";

export function MainLayout() {
  return (
    <StellarWalletModalProvider>
      <WalletOnboardingProvider>
        <MainLayoutBody />
      </WalletOnboardingProvider>
    </StellarWalletModalProvider>
  );
}

function MainLayoutBody() {
  const model = useMainLayoutModel();
  const sidebar = useMainLayoutSidebarState();
  const noSidebarRouteActive = isNoSidebarRoute(model.location.pathname);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);
  const { shouldShowMainApp } = useWalletOnboarding();

  const showMainApp = isWalletConnected && shouldShowMainApp;

  return (
    <>
      {showMainApp ? (
        <div className="app-shell h-screen">
          <div
            className="app-frame"
            data-sidebar-collapsed={
              sidebar.isNarrowViewport || sidebar.collapsed ? "true" : undefined
            }
            data-no-sidebar={noSidebarRouteActive ? "true" : undefined}
          >
            {!noSidebarRouteActive ? (
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
            ) : null}

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

              <main ref={model.mainReference}>
                <Outlet
                  key={`${model.location.pathname}:${model.location.key}`}
                />
              </main>
            </div>
          </div>

          <EnsureMissingPrivateAddressScalars />
          <PollAllAssetDeliveries />
          <PollPendingDeposits />
        </div>
      ) : (
        <ConnectWalletScreen walletKitLoaded={isWalletKitLoaded} />
      )}
    </>
  );
}
