import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import { hydrateReduxPrivacySdkState } from "@arcanetech/privacy-sdk-state-redux";
import {
  collectPoolContractIdsFromCoinItems,
  loadPrivacySdkState,
  startPoolMerkleBackgroundSync,
  syncPrivacySdkCaches,
} from "@/entities/privacy-sdk-state";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { privacySdkState, store } from "@/store/store.js";
import { clearPrivacyTransactContext } from "@/shared/lib/privacy-sdk/index.js";
import { bootstrapPrivacySdkClient } from "./privacy-sdk-bootstrap.js";

type StoreDispatchAction = Parameters<typeof store.dispatch>[0];

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
    if (trimmedPublicKey) {
      const loadedPrivacySdkState = loadPrivacySdkState(trimmedPublicKey);
      if (loadedPrivacySdkState && Object.keys(store.getState().privacySdkState).length === 0) {
        store.dispatch(
          hydrateReduxPrivacySdkState(loadedPrivacySdkState) as unknown as StoreDispatchAction,
        );
      }
    }
    syncPrivacySdkCaches({
      client,
      walletPublicKey: trimmedPublicKey,
      getState: store.getState,
    }).catch(() => {
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
      getPoolContractIds: () => collectPoolContractIdsFromCoinItems(store.getState()),
    });
  }, [client, ready, walletPublicKey]);
}

export function PrivacySdkProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<StellarPrivacyClient | undefined>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let cancelled = false;

    const runBootstrap = async () => {
      try {
        const created = await bootstrapPrivacySdkClient(privacySdkState.adapter);
        if (cancelled) {
          return;
        }
        setClient(created);
        setReady(true);
        setError(undefined);
      } catch (bootstrapError) {
        if (cancelled) {
          return;
        }
        clearPrivacyTransactContext();
        setClient(undefined);
        setReady(false);
        setError(
          bootstrapError instanceof Error
            ? bootstrapError
            : new Error(String(bootstrapError)),
        );
      }
    };

    runBootstrap().catch(() => {
      return;
    });

    return () => {
      cancelled = true;
      clearPrivacyTransactContext();
    };
  }, []);

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
    <PrivacySdkContext.Provider value={value}>{children}</PrivacySdkContext.Provider>
  );
}
