import { sequenceClaimEscrowNotes } from "./sequence-claim-escrow-notes";
import type { EscrowIndexNote } from "@/entities/escrow-index";

const CLAIMANT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const REGISTERED_PA = "stpl1registeredpermanent";
const POOL = "CINDEXEDPOOLADDRESS00000000000000000000000";
const TAG = "aa901161e699ab3d4ca43cd15e575408441197eba93de07e5da6a2826d2e82d9";
const CREATED_AT = "2026-01-15T00:00:00.000Z";
const NOTE_COUNT = 3;
const SCALAR_HEX_BYTES = 32;

function noteAt(seq: number): EscrowIndexNote {
  return {
    blindedRecipientTag: TAG,
    txId: `tx-escrow-${String(seq)}`,
    poolAddress: POOL,
    seq,
    escrowNonce: String(seq + 1),
    createdAt: CREATED_AT,
  };
}

describe("escrow sweep sequencer", () => {
  it("claims three notes in order with one auth signature each and no transaction signature", async () => {
    const claimed: string[] = [];
    const authSignatures: string[] = [];
    const transactionSignatures: string[] = [];
    const notes = [noteAt(0), noteAt(1), noteAt(2)];
    expect(notes).toHaveLength(NOTE_COUNT);

    await sequenceClaimEscrowNotes({
      notes,
      ensureWalletPrivateAddress: async () => REGISTERED_PA,
      ensureWalletScalar: async () => "aa".repeat(SCALAR_HEX_BYTES),
      claimNote: async ({ note, registeredPrivateAddress }) => {
        expect(registeredPrivateAddress).toBe(REGISTERED_PA);
        authSignatures.push(note.txId);
        claimed.push(note.txId);
      },
    });

    expect(claimed).toEqual(["tx-escrow-0", "tx-escrow-1", "tx-escrow-2"]);
    expect(authSignatures).toHaveLength(NOTE_COUNT);
    expect(transactionSignatures).toEqual([]);
    expect(JSON.stringify({ claimed, claimant: CLAIMANT })).toMatch(/G[A-Z0-9]{55}/);
    expect(JSON.stringify(claimed)).not.toMatch(/stpl1/i);
  });

  it("does not prompt when there are no discovered notes", async () => {
    let registerCalls = 0;
    await sequenceClaimEscrowNotes({
      notes: [],
      ensureWalletPrivateAddress: async () => {
        registerCalls += 1;
        return REGISTERED_PA;
      },
      ensureWalletScalar: async () => "aa".repeat(SCALAR_HEX_BYTES),
      claimNote: async () => {
        throw new Error("must not claim");
      },
    });
    expect(registerCalls).toBe(0);
  });

  it("sweeps only the recipient output when a send also indexed the change note", async () => {
    const claimed: number[] = [];
    const changeSeq = 1;
    await sequenceClaimEscrowNotes({
      notes: [
        { ...noteAt(changeSeq), txId: "tx-escrow-send", seq: changeSeq },
        { ...noteAt(0), txId: "tx-escrow-send", seq: 0 },
      ],
      ensureWalletPrivateAddress: async () => REGISTERED_PA,
      ensureWalletScalar: async () => "aa".repeat(SCALAR_HEX_BYTES),
      claimNote: async ({ note }) => {
        claimed.push(note.seq);
      },
    });
    expect(claimed).toEqual([0]);
  });

  it("stops on the first claim error and does not continue", async () => {
    const claimed: string[] = [];
    await expect(
      sequenceClaimEscrowNotes({
        notes: [noteAt(0), noteAt(1), noteAt(2)],
        ensureWalletPrivateAddress: async () => REGISTERED_PA,
        ensureWalletScalar: async () => "aa".repeat(SCALAR_HEX_BYTES),
        claimNote: async ({ note }) => {
          if (note.txId === "tx-escrow-0") {
            throw new Error("claim failed");
          }
          claimed.push(note.txId);
        },
      }),
    ).rejects.toThrow("claim failed");
    expect(claimed).toEqual([]);
  });
});
