import type { EscrowIndexNote } from "@/entities/escrow-index";
import { selectClaimableEscrowNotes } from "./sequence-claim-escrow-notes.js";
import { claimNoteKey } from "./claim-note-once.js";

export type PendingEscrowAssetClaim = {
  claimId: string;
  transactionId: string;
  assetId: string;
  amountDisplay: number;
};

export type EscrowClaimAssetCatalogEntry = {
  assetId: string;
  clientContract: string | null;
};

export function pendingEscrowClaimId(note: EscrowIndexNote): string {
  return claimNoteKey(note.txId, note.seq);
}

export function listVisibleEscrowNotes(input: {
  notes: readonly EscrowIndexNote[];
  claimedKeys: ReadonlySet<string>;
}): EscrowIndexNote[] {
  return selectClaimableEscrowNotes(input.notes).filter(
    (note) => !input.claimedKeys.has(pendingEscrowClaimId(note)),
  );
}

export function resolveClaimAssetId(input: {
  tokenAddress: string;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
  fallback: string;
}): string {
  const token = input.tokenAddress.trim();
  const match = input.catalog.find((asset) => asset.clientContract === token);
  return match?.assetId ?? input.fallback;
}

export function toPendingEscrowAssetClaim(input: {
  note: EscrowIndexNote;
  assetId: string;
  amountDisplay: number;
}): PendingEscrowAssetClaim {
  const claimId = pendingEscrowClaimId(input.note);
  return {
    claimId,
    transactionId: claimId,
    assetId: input.assetId,
    amountDisplay: input.amountDisplay,
  };
}
