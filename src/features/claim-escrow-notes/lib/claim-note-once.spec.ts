import {
  claimNoteOnce,
  claimNoteKey,
  resetClaimNoteOnceForTests,
} from "./claim-note-once";

describe("claimNoteOnce", () => {
  beforeEach(() => {
    resetClaimNoteOnceForTests();
  });

  it("runs a single claim when two callers race on the same note", async () => {
    let starts = 0;
    const claim = async () => {
      starts += 1;
      await Promise.resolve();
    };
    const key = claimNoteKey("tx-1", 0);
    await Promise.all([claimNoteOnce(key, claim), claimNoteOnce(key, claim)]);
    expect(starts).toBe(1);
  });

  it("treats an already-spent nullifier as a completed claim", async () => {
    const key = claimNoteKey("tx-2", 0);
    await claimNoteOnce(key, async () => {
      throw new Error("HostError: Error(Contract, #1) NullifierUsed");
    });
    let starts = 0;
    await claimNoteOnce(key, async () => {
      starts += 1;
    });
    expect(starts).toBe(0);
  });
});
