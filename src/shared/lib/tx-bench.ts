const TX_BENCH_PREFIX = "arcane-tx:";

export function markTxContinue(): void {
  performance.mark(`${TX_BENCH_PREFIX}ui.continue`);
}

export function beginTxReview(): void {
  markTxContinue();
  performance.mark(`${TX_BENCH_PREFIX}ui.review:start`);
}

export function endTxReview(): void {
  const start = `${TX_BENCH_PREFIX}ui.review:start`;
  if (performance.getEntriesByName(start, "mark").length === 0) {
    return;
  }
  const end = `${TX_BENCH_PREFIX}ui.review:end`;
  performance.mark(end);
  performance.measure(`${TX_BENCH_PREFIX}ui.review`, start, end);
}

export function markTxSuccess(): void {
  const name = `${TX_BENCH_PREFIX}ui.success`;
  if (performance.getEntriesByName(name, "mark").length > 0) {
    return;
  }
  performance.mark(name);
}
