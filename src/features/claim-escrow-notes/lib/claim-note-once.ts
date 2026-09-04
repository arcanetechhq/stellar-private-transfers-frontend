const claimedKeys = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

export function claimNoteKey(txId: string, seq: number): string {
  return `${txId}:${String(seq)}`;
}

export function rememberClaimedNoteKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    claimedKeys.add(trimmed);
  }
}

export function resetClaimNoteOnceForTests(): void {
  claimedKeys.clear();
  inFlight.clear();
}

function isAlreadySpentSweepError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /NullifierUsed|Error\(Contract, #1\)/u.test(message);
}

export async function claimNoteOnce(
  key: string,
  claim: () => Promise<void>,
): Promise<void> {
  if (claimedKeys.has(key)) {
    return;
  }
  const existing = inFlight.get(key);
  if (existing) {
    await existing;
    return;
  }
  const run = claim()
    .then(() => {
      claimedKeys.add(key);
    })
    .catch((error: unknown) => {
      if (isAlreadySpentSweepError(error)) {
        claimedKeys.add(key);
        return;
      }
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, run);
  await run;
}
