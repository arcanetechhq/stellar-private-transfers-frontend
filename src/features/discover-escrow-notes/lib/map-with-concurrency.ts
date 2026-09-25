type ConcurrencyRun<Item, Result> = {
  items: readonly Item[];
  mapItem: (item: Item) => Promise<Result>;
  results: Result[];
  nextIndex: number;
};

async function runConcurrencyWorker<Item, Result>(
  run: ConcurrencyRun<Item, Result>,
): Promise<void> {
  while (run.nextIndex < run.items.length) {
    const index = run.nextIndex;
    run.nextIndex += 1;
    const item = run.items[index];
    if (item === undefined) {
      continue;
    }
    run.results[index] = await run.mapItem(item);
  }
}

export async function mapWithConcurrency<Item, Result>(input: {
  items: readonly Item[];
  concurrency: number;
  mapItem: (item: Item) => Promise<Result>;
}): Promise<Result[]> {
  if (input.items.length === 0) {
    return [];
  }
  const run: ConcurrencyRun<Item, Result> = {
    items: input.items,
    mapItem: input.mapItem,
    results: [],
    nextIndex: 0,
  };
  const workerCount = Math.min(input.concurrency, input.items.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => runConcurrencyWorker(run)),
  );
  return run.results;
}
