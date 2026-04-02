const STORAGE_KEY_PREFIX = "coin-delivery-seen-tags";

function storageKey(publicKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${publicKey}`;
}

export type SeenTagsByAssetId = Record<string, string[]>;

export function loadSeenTags(publicKey: string): SeenTagsByAssetId {
  try {
    const raw = localStorage.getItem(storageKey(publicKey));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const result: SeenTagsByAssetId = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        result[key] = (value as unknown[]).filter(
          (item): item is string => typeof item === "string",
        );
      }
    }
    return result;
  } catch {
    return {};
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function saveSeenTags(publicKey: string, tags: SeenTagsByAssetId): void {
  void safeSetItem(storageKey(publicKey), JSON.stringify(tags));
}
