import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivacySdkClient } from "@/app/providers/privacy-sdk-provider.js";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { arePendingClaimsEqual } from "../lib/are-pending-claims-equal.js";
import type { PendingClaimItem } from "../model/pending-claim-types.js";
import { loadSdkPendingClaims } from "../lib/load-sdk-pending-claims.js";

const REFRESH_INTERVAL_MS = 30_000;

export function useSdkPendingClaimsList(
  ownerAddress: string | undefined,
  resolveAsset: (tokenAddress: string) => string | undefined,
): {
  claims: PendingClaimItem[];
  isLoading: boolean;
  isError: boolean;
  reload: (options?: { silent?: boolean }) => Promise<void>;
  removeClaim: (claimId: number) => void;
} {
  const { client, ready } = usePrivacySdkClient();
  const [claims, setClaims] = useState<PendingClaimItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const resolveAssetReference = useRef(resolveAsset);
  resolveAssetReference.current = resolveAsset;
  const hasLoadedReference = useRef(false);

  const reload = useCallback(
    async (options?: { silent?: boolean }) => {
      const trimmedOwner = ownerAddress?.trim();
      if (!trimmedOwner || !client || !ready) {
        hasLoadedReference.current = false;
        setClaims((current) => (current.length === 0 ? current : []));
        return;
      }
      const silent = options?.silent === true && hasLoadedReference.current;
      if (!silent) {
        setIsLoading(true);
      }
      setIsError(false);
      try {
        const mappedClaims = await loadSdkPendingClaims({
          client,
          owner: trimmedOwner,
          ready,
          resolveAsset: (tokenAddress) =>
            resolveAssetReference.current(tokenAddress),
        });
        hasLoadedReference.current = true;
        setClaims((current) =>
          arePendingClaimsEqual(current, mappedClaims) ? current : mappedClaims,
        );
      } catch {
        setIsError(true);
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [client, ownerAddress, ready],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const trimmedOwner = ownerAddress?.trim();
    if (!trimmedOwner || !client || !ready) {
      return;
    }
    const intervalId = globalThis.setInterval(() => {
      void reload({ silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [client, ownerAddress, ready, reload]);

  const removeClaim = useCallback((claimId: number) => {
    setClaims((current) => current.filter((claim) => claim.id !== claimId));
  }, []);

  return { claims, isLoading, isError, reload, removeClaim };
}

export function useSdkPendingClaimsCount(ownerAddress: string | undefined): number {
  const { client, ready } = usePrivacySdkClient();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const trimmedOwner = ownerAddress?.trim();
    if (!trimmedOwner || !client || !ready) {
      setCount(0);
      return;
    }
    let cancelled = false;
    const refreshCount = async () => {
      try {
        await client.loadPendingClaimsCountFromBackend({
          backendBaseUrl: getRequiredApiBaseUrl(),
          ownerAddress: trimmedOwner,
        });
        const nextCount = await client.getPendingClaimsCount(trimmedOwner);
        if (!cancelled) {
          setCount(nextCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          setCount(0);
        }
      }
    };
    void refreshCount();
    const intervalId = globalThis.setInterval(refreshCount, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      globalThis.clearInterval(intervalId);
    };
  }, [client, ownerAddress, ready]);

  return count;
}
