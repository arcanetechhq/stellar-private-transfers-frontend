import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { rememberClaimedNoteKey } from "../lib/claim-note-once.js";
import { loadClaimedEscrowNoteKeys } from "../lib/persist-claimed-escrow-notes.js";

function claimedKeysForWallet(owner: string | undefined): Set<string> {
  const persisted = owner ? loadClaimedEscrowNoteKeys(owner) : [];
  for (const key of persisted) {
    rememberClaimedNoteKey(key);
  }
  return new Set(persisted);
}

export function useEscrowClaimedKeys(walletPublicKey: string | undefined): {
  claimed: MutableRefObject<Set<string>>;
  claimedKeys: Set<string>;
  bumpClaimed: () => void;
} {
  const claimed = useRef(new Set<string>());
  const [claimedVersion, setClaimedVersion] = useState(0);

  useEffect(() => {
    claimed.current = claimedKeysForWallet(walletPublicKey?.trim());
    setClaimedVersion((current) => current + 1);
  }, [walletPublicKey]);

  const claimedKeys = useMemo(() => {
    return new Set(claimed.current);
  }, [claimedVersion]);

  return {
    claimed,
    claimedKeys,
    bumpClaimed: () => {
      setClaimedVersion((current) => current + 1);
    },
  };
}
