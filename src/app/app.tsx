import React from "react";
import { RouterProvider } from "react-router/dom";
import "@/shared/lib/stellar-wallet-kit";
import { useAppSelector } from "@/store";
import {
  selectIsWalletConnected,
  selectIsWalletKitLoaded,
} from "@/entities/wallet";
import { I18nProvider } from "./providers/i18n-provider";
import { MerkleTreeSyncProvider } from "./providers/merkle-tree-sync-provider";
import { StoreProvider } from "./providers/store-provider";
import { ConnectWalletGuard } from "@/widgets/connect-wallet-guard";
import { router } from "./routes";

function AppShell() {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);
  const shouldBlurApplication = isWalletKitLoaded && !isWalletConnected;

  return (
    <>
      <div
        className={
          shouldBlurApplication ? "pointer-events-none select-none" : undefined
        }
        style={shouldBlurApplication ? { filter: "blur(10px)" } : undefined}
      >
        <RouterProvider router={router} unstable_useTransitions={false} />
      </div>
      <ConnectWalletGuard />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MerkleTreeSyncProvider>
        <I18nProvider>
          <AppShell />
        </I18nProvider>
      </MerkleTreeSyncProvider>
    </StoreProvider>
  );
}
