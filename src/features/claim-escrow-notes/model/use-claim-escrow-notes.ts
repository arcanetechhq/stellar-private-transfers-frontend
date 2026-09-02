import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { useAppDispatch } from "@/store";
import { sequenceClaimEscrowNotes } from "../lib/sequence-claim-escrow-notes.js";
import { runEscrowSweepClaim } from "../lib/run-escrow-sweep-claim.js";

function noteKey(note: EscrowIndexNote): string {
  return `${note.txId}:${String(note.seq)}`;
}

export function useClaimEscrowNotes(input: {
  notes: readonly EscrowIndexNote[];
  walletPublicKey: string | undefined;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
}): void {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("overview");
  const inFlight = useRef(false);
  const halted = useRef(false);
  const claimed = useRef(new Set<string>());
  const { notes, walletPublicKey, ensureWalletPrivateAddress, ensureWalletScalar } =
    input;

  useEffect(() => {
    const owner = walletPublicKey?.trim();
    if (!owner || notes.length === 0 || inFlight.current || halted.current) {
      return;
    }
    const pending = notes.filter((note) => !claimed.current.has(noteKey(note)));
    if (pending.length === 0) {
      return;
    }
    inFlight.current = true;
    sequenceClaimEscrowNotes({
      notes: pending,
      ensureWalletPrivateAddress,
      ensureWalletScalar,
      claimNote: async ({ note, registeredPrivateAddress }) => {
        await runEscrowSweepClaim({
          dispatch,
          note,
          walletPublicKey: owner,
          registeredPrivateAddress,
        });
        claimed.current.add(noteKey(note));
      },
    })
      .catch(() => {
        halted.current = true;
        toast.error(translate("escrowClaimFailed"));
      })
      .finally(() => {
        inFlight.current = false;
      });
  }, [
    dispatch,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    notes,
    translate,
    walletPublicKey,
  ]);
}
