import React from "react";
import { RouterProvider } from "react-router";
import "@/shared/lib/stellar-wallet-kit";
import { I18nProvider } from "./providers/i18n-provider";
import { MerkleTreeSyncProvider } from "./providers/merkle-tree-sync-provider";
import { StoreProvider } from "./providers/store-provider";
import { router } from "./routes";

export default function App() {
  return (
    <StoreProvider>
      <MerkleTreeSyncProvider>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </MerkleTreeSyncProvider>
    </StoreProvider>
  );
}
