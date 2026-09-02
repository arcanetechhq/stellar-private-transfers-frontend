import { useCallback, useEffect, useRef, useState } from "react";
import {
  areEscrowNotesEqual,
  type EscrowIndexNote,
} from "@/entities/escrow-index";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { readStorageApiOriginFromEnvironment } from "@/shared/stellar/read-storage-api-origin.js";
import { discoverEscrowNotes } from "../lib/discover-escrow-notes.js";
import { signEscrowTagChallenge } from "../lib/sign-escrow-tag-challenge.js";

export function useDiscoverEscrowNotes(ownerAddress: string | undefined): {
  notes: EscrowIndexNote[];
  isLoading: boolean;
} {
  const [notes, setNotes] = useState<EscrowIndexNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedReference = useRef(false);

  const reload = useCallback(async () => {
    const stellarAddress = ownerAddress?.trim();
    const storageOrigin = readStorageApiOriginFromEnvironment();
    if (!stellarAddress || storageOrigin === undefined) {
      hasLoadedReference.current = false;
      setNotes((current) => (current.length === 0 ? current : []));
      return;
    }
    setIsLoading(true);
    try {
      const discovered = await discoverEscrowNotes({
        storageOrigin,
        transfersBaseUrl: getRequiredApiBaseUrl(),
        stellarAddress,
        signChallenge: (message) =>
          signEscrowTagChallenge({ message, address: stellarAddress }),
      });
      hasLoadedReference.current = true;
      setNotes((current) =>
        areEscrowNotesEqual(current, discovered) ? current : discovered,
      );
    } catch {
      setNotes((current) => (current.length === 0 ? current : []));
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { notes, isLoading };
}
