import React from "react";
import { Outlet } from "react-router";
import { MainLayoutHeader } from "./main-layout-header";
import { MainLayoutSidebar } from "./main-layout-sidebar";
import { NotificationsModal } from "./notifications-modal";
import {
  EnsureMissingPrivateAddressScalars,
  PollAllAssetDeliveries,
} from "@/features/poll-coin-deliveries";
import { PollPendingDeposits } from "@/features/poll-deposit";
import { useMainLayoutModel } from "../lib/use-main-layout-model";

export function MainLayout() {
  const model = useMainLayoutModel();

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#F4F4F2" }}>
      <MainLayoutSidebar
        navigation={model.navigation}
        bottomNavigation={model.bottomNavigation}
        pathname={model.location.pathname}
        translate={model.translate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MainLayoutHeader
          translate={model.translate}
          languageOpen={model.languageOpen}
          setLanguageOpen={model.setLanguageOpen}
          faucetOpen={model.faucetOpen}
          setFaucetOpen={model.setFaucetOpen}
          walletOpen={model.walletOpen}
          setWalletOpen={model.setWalletOpen}
          onOpenNotifications={() => model.setNotificationsOpen(true)}
          currentLanguage={model.currentLanguage}
          onSelectLanguage={model.handleLanguageChange}
        />

        <main ref={model.mainReference} className="flex-1 overflow-auto">
          <Outlet
            key={`${model.location.pathname}:${model.location.key}`}
          />
        </main>
      </div>

      <NotificationsModal
        isOpen={model.notificationsOpen}
        onClose={() => model.setNotificationsOpen(false)}
      />

      <EnsureMissingPrivateAddressScalars />
      <PollAllAssetDeliveries />
      <PollPendingDeposits />
    </div>
  );
}
