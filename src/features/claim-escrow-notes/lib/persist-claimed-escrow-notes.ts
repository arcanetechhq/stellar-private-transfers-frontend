const STORAGE_KEY_PREFIX = "stellar-payment-escrow-claimed-v1";

export function claimedEscrowNotesStorageKey(stellarAddress: string): string {
  return `${STORAGE_KEY_PREFIX}:${stellarAddress.trim()}`;
}

function parseClaimedKeys(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    );
  } catch {
    return [];
  }
}

export function loadClaimedEscrowNoteKeys(stellarAddress: string): string[] {
  const address = stellarAddress.trim();
  if (!address) {
    return [];
  }
  try {
    return parseClaimedKeys(
      localStorage.getItem(claimedEscrowNotesStorageKey(address)) ?? undefined,
    );
  } catch {
    return [];
  }
}

export function saveClaimedEscrowNoteKey(input: {
  stellarAddress: string;
  key: string;
}): void {
  const address = input.stellarAddress.trim();
  const key = input.key.trim();
  if (!address || !key) {
    return;
  }
  const next = new Set(loadClaimedEscrowNoteKeys(address));
  next.add(key);
  try {
    localStorage.setItem(
      claimedEscrowNotesStorageKey(address),
      JSON.stringify([...next]),
    );
  } catch {
    return;
  }
}
