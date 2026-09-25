const FAST_EPOCH_COUNT = 6;
const NEWEST_EPOCH_POLL_MS = 24_000;
const OLDEST_EPOCH_POLL_MS = 180_000;

export function escrowEpochPollIntervalMs(input: {
  epoch: number;
  newestEpoch: number;
  oldestEpoch: number;
}): number {
  const age = Math.max(0, input.newestEpoch - input.epoch);
  if (age < FAST_EPOCH_COUNT) {
    return NEWEST_EPOCH_POLL_MS;
  }
  const rampSpan = input.newestEpoch - input.oldestEpoch - (FAST_EPOCH_COUNT - 1);
  if (rampSpan <= 0) {
    return OLDEST_EPOCH_POLL_MS;
  }
  const progress = Math.min(1, (age - (FAST_EPOCH_COUNT - 1)) / rampSpan);
  return (
    NEWEST_EPOCH_POLL_MS +
    (OLDEST_EPOCH_POLL_MS - NEWEST_EPOCH_POLL_MS) * progress
  );
}
