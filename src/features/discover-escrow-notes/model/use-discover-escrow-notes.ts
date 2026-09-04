import { useCallback, useEffect, useRef, useState } from "react";
import {
  areEscrowNotesEqual,
  type EscrowIndexNote,
} from "@/entities/escrow-index";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { readStorageApiOriginFromEnvironment } from "@/shared/stellar/read-storage-api-origin.js";
import { discoverEscrowNotes } from "../lib/discover-escrow-notes.js";
import { localStorageEscrowTagStore } from "../lib/persist-escrow-tags.js";
import { signEscrowTagChallenge } from "../lib/sign-escrow-tag-challenge.js";

const ESCROW_NOTE_REFRESH_MS = 8000;

export function useDiscoverEscrowNotes(ownerAddress: string | undefined): {
  notes: EscrowIndexNote[];
  isLoading: boolean;
} {
  const [notes, setNotes] = useState<EscrowIndexNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inFlight = useRef(false);

  const reload = useCallback(async () => {
    const stellarAddress = ownerAddress?.trim();
    if (!stellarAddress) {
      setNotes((current) => (current.length === 0 ? current : []));
      return;
    }
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    const hasCachedTags = Boolean(
      localStorageEscrowTagStore.read(stellarAddress)?.length,
    );
    if (!hasCachedTags) {
      setIsLoading(true);
    }
    try {
      const storageOrigin = readStorageApiOriginFromEnvironment();
      const discovered = await discoverEscrowNotes({
        transfersBaseUrl: getRequiredApiBaseUrl(),
        stellarAddress,
        signChallenge: (message) =>
          signEscrowTagChallenge({ message, address: stellarAddress }),
        ...(storageOrigin === undefined ? {} : { storageOrigin }),
      });
      setNotes((current) =>
        areEscrowNotesEqual(current, discovered) ? current : discovered,
      );
    } catch {
      setNotes((current) => (current.length === 0 ? current : []));
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [ownerAddress]);

  useEffect(() => {
    void reload();
    const timer = globalThis.setInterval(() => {
      void reload();
    }, ESCROW_NOTE_REFRESH_MS);
    return () => {
      globalThis.clearInterval(timer);
    };
  }, [reload]);

  return { notes, isLoading };
}
