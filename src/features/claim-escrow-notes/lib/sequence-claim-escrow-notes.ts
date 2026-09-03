import type { EscrowIndexNote } from "@/entities/escrow-index";

export function selectClaimableEscrowNotes(
  notes: readonly EscrowIndexNote[],
): EscrowIndexNote[] {
  const recipientByTx = new Map<string, EscrowIndexNote>();
  for (const note of notes) {
    const current = recipientByTx.get(note.txId);
    if (current === undefined || note.seq < current.seq) {
      recipientByTx.set(note.txId, note);
    }
  }
  return [...recipientByTx.values()].toSorted((left, right) => {
    if (left.createdAt !== right.createdAt) {
      return left.createdAt < right.createdAt ? -1 : 1;
    }
    return left.seq - right.seq;
  });
}

export async function sequenceClaimEscrowNotes(input: {
  notes: readonly EscrowIndexNote[];
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  claimNote: (parameters: {
    note: EscrowIndexNote;
    registeredPrivateAddress: string;
  }) => Promise<void>;
}): Promise<void> {
  const notes = selectClaimableEscrowNotes(input.notes);
  if (notes.length === 0) {
    return;
  }
  const registeredPrivateAddress = await input.ensureWalletPrivateAddress();
  await input.ensureWalletScalar();
  for (const note of notes) {
    await input.claimNote({ note, registeredPrivateAddress });
  }
}
