import type { EscrowIndexNote } from "@/entities/escrow-index";

export async function sequenceClaimEscrowNotes(input: {
  notes: readonly EscrowIndexNote[];
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  claimNote: (parameters: {
    note: EscrowIndexNote;
    registeredPrivateAddress: string;
  }) => Promise<void>;
}): Promise<void> {
  if (input.notes.length === 0) {
    return;
  }
  const registeredPrivateAddress = await input.ensureWalletPrivateAddress();
  await input.ensureWalletScalar();
  for (const note of input.notes) {
    await input.claimNote({ note, registeredPrivateAddress });
  }
}
