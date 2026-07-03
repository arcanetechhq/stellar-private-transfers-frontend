import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import "./sidebar.css";
import "./header-faucet.css";
import { useAppSelector } from "@/store";
import {
  selectIsWalletConnected,
  selectIsWalletKitLoaded,
} from "@/entities/wallet";
import {
  isWalletRegistryChecking,
  useWalletPrivateAddress,
} from "@/features/register-private-address";
import { StellarWalletModalProvider, useStellarWalletModal } from "@/features/stellar-wallet-connect";
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
      <MainLayoutBody />
    </StellarWalletModalProvider>
  );
}

function MainLayoutBody() {
  const model = useMainLayoutModel();
  const sidebar = useMainLayoutSidebarState();
  const noSidebarRouteActive = isNoSidebarRoute(model.location.pathname);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);
  const { registryStatus, isRegistryLoading } = useWalletPrivateAddress();
  const { isWalletChangeInProgress } = useStellarWalletModal();
  const [hasUnlockedApp, setHasUnlockedApp] = useState(false);
  const isAccountConnecting =
    isWalletConnected &&
    isWalletRegistryChecking(registryStatus, isRegistryLoading);

  useEffect(() => {
    if (!isWalletConnected) {
      setHasUnlockedApp(false);
      return;
    }
    if (!isAccountConnecting) {
      setHasUnlockedApp(true);
    }
  }, [isWalletConnected, isAccountConnecting]);

  const showMainApp =
    isWalletConnected &&
    (hasUnlockedApp || !isAccountConnecting || isWalletChangeInProgress);

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

              <main ref={model.mainReference} className="flex-1 overflow-auto">
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
