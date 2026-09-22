import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import {
  collectPoolContractIdsFromCoinItems,
  hydratePrivacySdkClient,
  startPoolMerkleBackgroundSync,
  syncPrivacySdkCaches,
} from "@/entities/privacy-sdk-state";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { store } from "@/store/store.js";
import { loadPrivateAddressState } from "@/entities/private-address";
import { usePrivacySdkBootstrapState } from "./use-privacy-sdk-bootstrap-state.js";

interface PrivacySdkContextValue {
  client: StellarPrivacyClient | undefined;
  ready: boolean;
  error: Error | undefined;
}

const PrivacySdkContext = createContext<PrivacySdkContextValue>({
  client: undefined,
  ready: false,
  error: undefined,
});

export function usePrivacySdkClient(): PrivacySdkContextValue {
  return useContext(PrivacySdkContext);
}

function usePrivacySdkCacheSync(
  client: StellarPrivacyClient | undefined,
  ready: boolean,
): void {
  const walletPublicKey = useAppSelector(selectWalletPublicKey);

  useEffect(() => {
    if (!ready || !client) {
      return;
    }
    const trimmedPublicKey = walletPublicKey?.trim();
    if (!trimmedPublicKey) {
      return;
    }
    hydratePrivacySdkClient({
      client,
      walletPublicKey: trimmedPublicKey,
      legacyPrivateAddress: loadPrivateAddressState(trimmedPublicKey),
    })
      .then(() =>
        syncPrivacySdkCaches({
          client,
          walletPublicKey: trimmedPublicKey,
          getState: store.getState,
        }),
      )
      .catch(() => {
        return;
      });
  }, [client, ready, walletPublicKey]);

  useEffect(() => {
    if (!ready || !client) {
      return;
    }
    return startPoolMerkleBackgroundSync({
      client,
      walletPublicKey,
      getPoolContractIds: () =>
        collectPoolContractIdsFromCoinItems(store.getState()),
    });
  }, [client, ready, walletPublicKey]);
}

export function PrivacySdkProvider({ children }: { children: ReactNode }) {
  const { client, ready, error } = usePrivacySdkBootstrapState();
  usePrivacySdkCacheSync(client, ready);

  const value = useMemo(
    () => ({
      client,
      ready,
      error,
    }),
    [client, ready, error],
  );

  return (
    <PrivacySdkContext.Provider value={value}>
      {children}
    </PrivacySdkContext.Provider>
  );
}
