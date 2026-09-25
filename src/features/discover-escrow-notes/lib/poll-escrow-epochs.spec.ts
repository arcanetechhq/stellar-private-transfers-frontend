import type { IssuedBlindedRecipientTag } from "./issue-escrow-tags";
import { startEscrowEpochPolling } from "./poll-escrow-epochs";

const EPOCH_COUNT = 8;
const FETCH_CONCURRENCY = 6;
const NEWEST_POLL_MS = 24_000;

type PendingFetch = {
  epoch: number;
  finish: () => void;
};

function tagsForEpochs(epochCount: number): IssuedBlindedRecipientTag[] {
  return Array.from({ length: epochCount }, (_unused, epoch) => ({
    epoch,
    tag: `tag-${epoch}`,
  }));
}

async function drainPending(pending: PendingFetch[]): Promise<void> {
  while (pending.length > 0) {
    const batch = pending.splice(0);
    for (const entry of batch) {
      entry.finish();
    }
    await Promise.resolve();
    await Promise.resolve();
  }
}

describe("escrow epoch polling queue", () => {
  it("fetches every epoch on connect with at most six requests in flight", async () => {
    const pending: PendingFetch[] = [];
    let active = 0;
    let maxActive = 0;
    let settled = false;
    const noted: number[] = [];
    let clock = 0;
    const timers: Array<{ dueAt: number; callback: () => void }> = [];

    const stop = startEscrowEpochPolling({
      tags: tagsForEpochs(EPOCH_COUNT),
      onInitialSettled: () => {
        settled = true;
      },
      onTagNotes: (tag) => {
        noted.push(Number(tag.replace("tag-", "")));
      },
      clock: {
        now: () => clock,
        schedule: (callback, delayMs) => {
          timers.push({ dueAt: clock + delayMs, callback });
          return timers.length;
        },
        clearSchedule: () => {},
      },
      listTag: (entry) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        return new Promise((resolve) => {
          pending.push({
            epoch: entry.epoch,
            finish: () => {
              active -= 1;
              resolve([]);
            },
          });
        });
      },
    });

    await Promise.resolve();
    expect(active).toBe(FETCH_CONCURRENCY);
    expect(
      pending
        .map((entry) => entry.epoch)
        .toSorted((left, right) => right - left),
    ).toEqual(
      Array.from(
        { length: FETCH_CONCURRENCY },
        (_unused, index) => EPOCH_COUNT - 1 - index,
      ),
    );

    await drainPending(pending);

    expect(settled).toBe(true);
    expect(maxActive).toBe(FETCH_CONCURRENCY);
    expect(noted.toSorted((left, right) => left - right)).toEqual(
      Array.from({ length: EPOCH_COUNT }, (_unused, index) => index),
    );

    clock = NEWEST_POLL_MS;
    const due = timers.filter((timer) => timer.dueAt <= clock);
    expect(due.length).toBeGreaterThan(0);
    stop();
  });
});
