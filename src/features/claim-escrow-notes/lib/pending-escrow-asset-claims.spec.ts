import {
  listVisibleEscrowNotes,
  pendingEscrowClaimId,
  resolveClaimAssetId,
  toPendingEscrowAssetClaim,
} from "./pending-escrow-asset-claims.js";
import type { EscrowIndexNote } from "@/entities/escrow-index";

const POOL = "CINDEXEDPOOLADDRESS00000000000000000000000";
const TAG = "aa901161e699ab3d4ca43cd15e575408441197eba93de07e5da6a2826d2e82d9";
const CREATED_AT = "2026-01-15T00:00:00.000Z";
const TOKEN = "CTOKENADDRESS00000000000000000000000000000";
const FALLBACK_ASSET = "Unknown";
const NOTE_VALUE = 40;

function noteAt(seq: number): EscrowIndexNote {
  return {
    blindedRecipientTag: TAG,
    txId: "tx-escrow-send",
    poolAddress: POOL,
    seq,
    escrowNonce: String(seq + 1),
    createdAt: CREATED_AT,
  };
}

describe("pending escrow asset claims", () => {
  it("keeps only the lowest-seq output per send for the Receive row", () => {
    const visible = listVisibleEscrowNotes({
      notes: [noteAt(1), noteAt(0)],
      claimedKeys: new Set(),
    });
    expect(visible.map((note) => note.seq)).toEqual([0]);
  });

  it("hides notes that were already claimed", () => {
    const claimed = noteAt(0);
    const visible = listVisibleEscrowNotes({
      notes: [claimed],
      claimedKeys: new Set([pendingEscrowClaimId(claimed)]),
    });
    expect(visible).toEqual([]);
  });

  it("resolves the catalog ticker from the reconstructed token contract", () => {
    expect(
      resolveClaimAssetId({
        tokenAddress: TOKEN,
        catalog: [{ assetId: "usdc", clientContract: TOKEN }],
        fallback: FALLBACK_ASSET,
      }),
    ).toBe("usdc");
  });

  it("maps a visible note onto the Private assets Receive row", () => {
    const row = toPendingEscrowAssetClaim({
      note: noteAt(0),
      assetId: "usdc",
      amountDisplay: NOTE_VALUE,
    });
    expect(row.transactionId).toBe(row.claimId);
    expect(row.assetId).toBe("usdc");
    expect(row.amountDisplay).toBe(NOTE_VALUE);
  });
});
