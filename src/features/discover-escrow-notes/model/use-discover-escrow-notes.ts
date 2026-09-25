import { useEffect, useState } from "react";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { startEscrowNoteDiscovery } from "../lib/start-escrow-note-discovery.js";

function clearNotes(current: EscrowIndexNote[]): EscrowIndexNote[] {
  return current.length === 0 ? current : [];
}

export function useDiscoverEscrowNotes(ownerAddress: string | undefined): {
  notes: EscrowIndexNote[];
  isLoading: boolean;
} {
  const [notes, setNotes] = useState<EscrowIndexNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stellarAddress = ownerAddress?.trim();
    if (!stellarAddress) {
      setNotes(clearNotes);
      setIsLoading(false);
      return;
    }
    setNotes(clearNotes);
    return startEscrowNoteDiscovery({
      stellarAddress,
      setNotes,
      setLoading: setIsLoading,
    });
  }, [ownerAddress]);

  return { notes, isLoading };
}
