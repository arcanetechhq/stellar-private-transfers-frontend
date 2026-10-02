import type { IssuedBlindedRecipientTag } from "./issued-blinded-recipient-tag.js";
import { escrowEpochPollIntervalMs } from "./escrow-epoch-poll-interval.js";
import type { EscrowIndexNote } from "@/entities/escrow-index";

const FETCH_CONCURRENCY = 6;

type DueEpoch = {
  entry: IssuedBlindedRecipientTag;
  dueAt: number;
  initial: boolean;
};

type PollClock = {
  now: () => number;
  schedule: (callback: () => void, delayMs: number) => number;
  clearSchedule: (timerId: number) => void;
};

export type EscrowEpochPolling = {
  tags: readonly IssuedBlindedRecipientTag[];
  listTag: (entry: IssuedBlindedRecipientTag) => Promise<EscrowIndexNote[]>;
  onTagNotes: (tag: string, notes: readonly EscrowIndexNote[]) => void;
  onInitialSettled: () => void;
  clock?: PollClock;
};

type PollRuntime = EscrowEpochPolling &
  PollClock & {
    newestEpoch: number;
    oldestEpoch: number;
    queue: DueEpoch[];
    active: number;
    initialLeft: number;
    stopped: boolean;
    wakeId: number | undefined;
  };

function epochBounds(tags: readonly IssuedBlindedRecipientTag[]): {
  newestEpoch: number;
  oldestEpoch: number;
} {
  let newestEpoch = tags[0]?.epoch ?? 0;
  let oldestEpoch = newestEpoch;
  for (const entry of tags) {
    if (entry.epoch > newestEpoch) {
      newestEpoch = entry.epoch;
    }
    if (entry.epoch < oldestEpoch) {
      oldestEpoch = entry.epoch;
    }
  }
  return { newestEpoch, oldestEpoch };
}

function takeDue(runtime: PollRuntime): DueEpoch | undefined {
  const now = runtime.now();
  let dueIndex = -1;
  let dueAt = Number.POSITIVE_INFINITY;
  for (const [index, job] of runtime.queue.entries()) {
    if (job.dueAt <= now && job.dueAt < dueAt) {
      dueIndex = index;
      dueAt = job.dueAt;
    }
  }
  if (dueIndex < 0) {
    return undefined;
  }
  const [job] = runtime.queue.splice(dueIndex, 1);
  return job;
}

function clearWake(runtime: PollRuntime): void {
  if (runtime.wakeId === undefined) {
    return;
  }
  runtime.clearSchedule(runtime.wakeId);
  runtime.wakeId = undefined;
}

function soonestDueAt(runtime: PollRuntime): number | undefined {
  let soonest: number | undefined;
  for (const job of runtime.queue) {
    if (soonest === undefined || job.dueAt < soonest) {
      soonest = job.dueAt;
    }
  }
  return soonest;
}

function scheduleWake(runtime: PollRuntime): void {
  clearWake(runtime);
  if (runtime.stopped || runtime.active >= FETCH_CONCURRENCY) {
    return;
  }
  const soonest = soonestDueAt(runtime);
  if (soonest === undefined) {
    return;
  }
  const delayMs = soonest - runtime.now();
  if (delayMs <= 0) {
    return;
  }
  runtime.wakeId = runtime.schedule(() => {
    runtime.wakeId = undefined;
    if (!runtime.stopped) {
      pump(runtime);
    }
  }, delayMs);
}

function requeue(runtime: PollRuntime, job: DueEpoch): void {
  runtime.queue.push({
    entry: job.entry,
    initial: false,
    dueAt:
      runtime.now() +
      escrowEpochPollIntervalMs({
        epoch: job.entry.epoch,
        newestEpoch: runtime.newestEpoch,
        oldestEpoch: runtime.oldestEpoch,
      }),
  });
}

function settleInitial(runtime: PollRuntime, job: DueEpoch): void {
  if (!job.initial) {
    return;
  }
  runtime.initialLeft -= 1;
  if (runtime.initialLeft === 0) {
    runtime.onInitialSettled();
  }
}

async function runJob(runtime: PollRuntime, job: DueEpoch): Promise<void> {
  try {
    const notes = await runtime.listTag(job.entry);
    if (!runtime.stopped) {
      runtime.onTagNotes(job.entry.tag, notes);
    }
  } finally {
    runtime.active -= 1;
    if (!runtime.stopped) {
      settleInitial(runtime, job);
      requeue(runtime, job);
    }
    pump(runtime);
  }
}

function ignoreRefreshFailure(): void {
  return;
}

function pump(runtime: PollRuntime): void {
  if (runtime.stopped) {
    return;
  }
  while (runtime.active < FETCH_CONCURRENCY) {
    const job = takeDue(runtime);
    if (job === undefined) {
      break;
    }
    runtime.active += 1;
    void runJob(runtime, job).catch(ignoreRefreshFailure);
  }
  scheduleWake(runtime);
}

function defaultClock(): PollClock {
  const timers = new Map<number, ReturnType<typeof globalThis.setTimeout>>();
  let nextTimerId = 1;
  return {
    now: () => Date.now(),
    schedule: (callback, delayMs) => {
      const timerId = nextTimerId;
      nextTimerId += 1;
      timers.set(timerId, globalThis.setTimeout(callback, delayMs));
      return timerId;
    },
    clearSchedule: (timerId) => {
      const handle = timers.get(timerId);
      if (handle === undefined) {
        return;
      }
      globalThis.clearTimeout(handle);
      timers.delete(timerId);
    },
  };
}

export function startEscrowEpochPolling(input: EscrowEpochPolling): () => void {
  const bounds = epochBounds(input.tags);
  const clock = input.clock ?? defaultClock();
  const startedAt = clock.now();
  const runtime: PollRuntime = {
    ...input,
    ...clock,
    ...bounds,
    queue: input.tags
      .toSorted((left, right) => right.epoch - left.epoch)
      .map((entry) => ({
        entry,
        dueAt: startedAt,
        initial: true,
      })),
    active: 0,
    initialLeft: input.tags.length,
    stopped: false,
    wakeId: undefined,
  };
  pump(runtime);
  return () => {
    runtime.stopped = true;
    clearWake(runtime);
  };
}
