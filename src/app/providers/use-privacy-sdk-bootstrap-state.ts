import { useEffect, useMemo, useState } from "react";
import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import {
  clearPrivacyTransactContext,
  setPrivacySdkBootstrapError,
} from "@/shared/lib/privacy-sdk/index.js";
import { privacySdkState } from "@/store/store.js";
import { bootstrapPrivacySdkClient } from "./privacy-sdk-bootstrap.js";

type PrivacySdkBootstrapState = {
  client: StellarPrivacyClient | undefined;
  ready: boolean;
  error: Error | undefined;
};

type BootstrapSetters = {
  setClient: (client: StellarPrivacyClient | undefined) => void;
  setReady: (ready: boolean) => void;
  setError: (error: Error | undefined) => void;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

async function runPrivacySdkBootstrap(
  cancelled: { current: boolean },
  setters: BootstrapSetters,
): Promise<void> {
  try {
    const created = await bootstrapPrivacySdkClient(privacySdkState.adapter);
    if (cancelled.current) {
      return;
    }
    setters.setClient(created);
    setters.setReady(true);
    setters.setError(undefined);
  } catch (bootstrapError) {
    if (cancelled.current) {
      return;
    }
    const nextError = toError(bootstrapError);
    clearPrivacyTransactContext();
    setPrivacySdkBootstrapError(nextError.message);
    setters.setClient(undefined);
    setters.setReady(false);
    setters.setError(nextError);
  }
}

export function usePrivacySdkBootstrapState(): PrivacySdkBootstrapState {
  const [client, setClient] = useState<StellarPrivacyClient | undefined>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const cancelled = { current: false };
    runPrivacySdkBootstrap(cancelled, {
      setClient,
      setReady,
      setError,
    }).catch(() => {
      return;
    });
    return () => {
      cancelled.current = true;
      clearPrivacyTransactContext();
    };
  }, []);

  return useMemo(
    () => ({
      client,
      ready,
      error,
    }),
    [client, ready, error],
  );
}
