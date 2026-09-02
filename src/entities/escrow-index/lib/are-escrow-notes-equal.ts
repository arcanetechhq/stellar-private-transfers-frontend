import type { EscrowIndexNote } from "../model/escrow-index-types.js";

function isSameEscrowNote(
  left: EscrowIndexNote,
  right: EscrowIndexNote,
): boolean {
  return (
    left.blindedRecipientTag === right.blindedRecipientTag &&
    left.txId === right.txId &&
    left.poolAddress === right.poolAddress &&
    left.seq === right.seq &&
    left.escrowNonce === right.escrowNonce &&
    left.createdAt === right.createdAt
  );
}

export function areEscrowNotesEqual(
  left: readonly EscrowIndexNote[],
  right: readonly EscrowIndexNote[],
): boolean {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  return left.every((note, index) => {
    const other = right[index];
    return other !== undefined && isSameEscrowNote(note, other);
  });
}
