import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MutableRefObject } from "react";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { useGetAssetsQuery } from "@/entities/asset";
import { useAppDispatch, type AppDispatch } from "@/store";
import { runEscrowSweepClaim } from "../lib/run-escrow-sweep-claim.js";
import {
  claimNoteKey,
  claimNoteOnce,
  rememberClaimedNoteKey,
} from "../lib/claim-note-once.js";
import { saveClaimedEscrowNoteKey } from "../lib/persist-claimed-escrow-notes.js";
import {
  listVisibleEscrowNotes,
  pendingEscrowClaimId,
  type EscrowClaimAssetCatalogEntry,
} from "../lib/pending-escrow-asset-claims.js";

function claimErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return fallback;
}

async function runClickedEscrowClaim(input: {
  note: EscrowIndexNote;
  owner: string;
  dispatch: AppDispatch;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
}): Promise<string> {
  const key = claimNoteKey(input.note.txId, input.note.seq);
  const registeredPrivateAddress = await input.ensureWalletPrivateAddress();
  await input.ensureWalletScalar();
  await claimNoteOnce(key, async () => {
    await runEscrowSweepClaim({
      dispatch: input.dispatch,
      note: input.note,
      walletPublicKey: input.owner,
      registeredPrivateAddress,
      catalog: input.catalog,
    });
  });
  return key;
}

function startReceiveClick(input: {
  transactionId: string;
  notes: readonly EscrowIndexNote[];
  claimedKeys: ReadonlySet<string>;
  owner: string | undefined;
  canClaim: boolean;
  claimingId: string | undefined;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
  dispatch: AppDispatch;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  claimed: MutableRefObject<Set<string>>;
  bumpClaimed: () => void;
  setError: (value: string | undefined) => void;
  setClaimingId: (value: string | undefined) => void;
  fallbackError: string;
}): void {
  const owner = input.owner?.trim();
  const note = listVisibleEscrowNotes({
    notes: input.notes,
    claimedKeys: input.claimedKeys,
  }).find((entry) => pendingEscrowClaimId(entry) === input.transactionId);
  if (!owner || !note || !input.canClaim || input.claimingId) {
    return;
  }
  input.setError(undefined);
  input.setClaimingId(pendingEscrowClaimId(note));
  runClickedEscrowClaim({
    note,
    owner,
    dispatch: input.dispatch,
    catalog: input.catalog,
    ensureWalletPrivateAddress: input.ensureWalletPrivateAddress,
    ensureWalletScalar: input.ensureWalletScalar,
  })
    .then((key) => {
      input.claimed.current.add(key);
      rememberClaimedNoteKey(key);
      saveClaimedEscrowNoteKey({ stellarAddress: owner, key });
      input.bumpClaimed();
    })
    .catch((error_: unknown) => {
      input.setError(claimErrorMessage(error_, input.fallbackError));
    })
    .finally(() => {
      input.setClaimingId(undefined);
    });
}

export function useEscrowReceiveClick(input: {
  notes: readonly EscrowIndexNote[];
  claimed: MutableRefObject<Set<string>>;
  claimedKeys: ReadonlySet<string>;
  walletPublicKey: string | undefined;
  canClaim: boolean;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  bumpClaimed: () => void;
}): {
  claimingId: string | undefined;
  error: string | undefined;
  onClaim: (transactionId: string) => void;
} {
  const dispatch = useAppDispatch();
  const { data: catalog } = useGetAssetsQuery();
  const { t: translate } = useTranslation("overview");
  const [claimingId, setClaimingId] = useState<string>();
  const [error, setError] = useState<string>();
  const {
    notes,
    claimed,
    claimedKeys,
    walletPublicKey,
    canClaim,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    bumpClaimed,
  } = input;

  useEffect(() => {
    setClaimingId(undefined);
    setError(undefined);
  }, [walletPublicKey]);

  const onClaim = useCallback(
    (transactionId: string) => {
      startReceiveClick({
        transactionId,
        notes,
        claimedKeys,
        owner: walletPublicKey,
        canClaim,
        claimingId,
        catalog: catalog ?? [],
        dispatch,
        ensureWalletPrivateAddress,
        ensureWalletScalar,
        claimed,
        bumpClaimed,
        setError,
        setClaimingId,
        fallbackError: translate("escrowClaimFailed"),
      });
    },
    [
      bumpClaimed,
      canClaim,
      catalog,
      claimed,
      claimedKeys,
      claimingId,
      dispatch,
      ensureWalletPrivateAddress,
      ensureWalletScalar,
      notes,
      translate,
      walletPublicKey,
    ],
  );

  return { claimingId, error, onClaim };
}
