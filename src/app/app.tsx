import React from "react";
import { RouterProvider } from "react-router/dom";
import "@/shared/lib/stellar-wallet-kit";
import { I18nProvider } from "./providers/i18n-provider";
import { MerkleTreeSyncProvider } from "./providers/merkle-tree-sync-provider";
import { StoreProvider } from "./providers/store-provider";
import { ConnectWalletGuard } from "@/widgets/connect-wallet-guard";
import { router } from "./routes";

export default function App() {
  return (
    <StoreProvider>
      <MerkleTreeSyncProvider>
        <I18nProvider>
          <RouterProvider router={router} unstable_useTransitions={false} />
          <ConnectWalletGuard />
        </I18nProvider>
      </MerkleTreeSyncProvider>
    </StoreProvider>
  );
}
