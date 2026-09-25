import { escrowEpochPollIntervalMs } from "./escrow-epoch-poll-interval";

const NEWEST_EPOCH = 33;
const OLDEST_EPOCH = 0;
const NEWEST_POLL_MS = 24_000;
const OLDEST_POLL_MS = 180_000;
const FAST_EPOCH_COUNT = 6;

describe("escrow epoch poll interval", () => {
  it("keeps the six newest epochs on the 24 second period", () => {
    for (let age = 0; age < FAST_EPOCH_COUNT; age += 1) {
      expect(
        escrowEpochPollIntervalMs({
          epoch: NEWEST_EPOCH - age,
          newestEpoch: NEWEST_EPOCH,
          oldestEpoch: OLDEST_EPOCH,
        }),
      ).toBe(NEWEST_POLL_MS);
    }
  });

  it("polls the oldest epoch once every three minutes", () => {
    expect(
      escrowEpochPollIntervalMs({
        epoch: OLDEST_EPOCH,
        newestEpoch: NEWEST_EPOCH,
        oldestEpoch: OLDEST_EPOCH,
      }),
    ).toBe(OLDEST_POLL_MS);
  });

  it("lengthens the period linearly for epochs older than the newest six", () => {
    const justOutside = escrowEpochPollIntervalMs({
      epoch: NEWEST_EPOCH - FAST_EPOCH_COUNT,
      newestEpoch: NEWEST_EPOCH,
      oldestEpoch: OLDEST_EPOCH,
    });
    const midway = escrowEpochPollIntervalMs({
      epoch: 14,
      newestEpoch: NEWEST_EPOCH,
      oldestEpoch: OLDEST_EPOCH,
    });
    expect(justOutside).toBeGreaterThan(NEWEST_POLL_MS);
    expect(justOutside).toBeLessThan(midway);
    expect(midway).toBeLessThan(OLDEST_POLL_MS);
  });
});
