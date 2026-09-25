import { mapWithConcurrency } from "./map-with-concurrency";

const ITEM_COUNT = 8;
const CONCURRENCY = 6;

describe("mapWithConcurrency", () => {
  it("runs at most the requested number of items at once and keeps order", async () => {
    let active = 0;
    let maxActive = 0;
    const release: Array<(value: number) => void> = [];
    const results = mapWithConcurrency({
      items: Array.from({ length: ITEM_COUNT }, (_unused, index) => index),
      concurrency: CONCURRENCY,
      mapItem: (item) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        return new Promise<number>((resolve) => {
          release.push((value) => {
            active -= 1;
            resolve(value);
          });
        }).then(() => item);
      },
    });

    await Promise.resolve();
    expect(active).toBe(CONCURRENCY);
    expect(release).toHaveLength(CONCURRENCY);

    for (const finish of release.splice(0)) {
      finish(0);
      await Promise.resolve();
    }
    while (release.length > 0) {
      const finish = release.shift();
      finish?.(0);
      await Promise.resolve();
    }

    await expect(results).resolves.toEqual(
      Array.from({ length: ITEM_COUNT }, (_unused, index) => index),
    );
    expect(maxActive).toBe(CONCURRENCY);
  });
});
