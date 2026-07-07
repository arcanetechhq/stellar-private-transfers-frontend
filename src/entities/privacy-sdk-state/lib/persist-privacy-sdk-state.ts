const STORAGE_KEY_PREFIX = "privacy-sdk-state-v1";

function storageKeyForWallet(publicKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${publicKey}`;
}

function parseStoredBranch(raw: string): Record<string, unknown> | undefined {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return undefined;
  }
  return parsed as Record<string, unknown>;
}

export function loadPrivacySdkState(
  publicKey: string,
): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(storageKeyForWallet(publicKey));
    if (!raw) {
      return undefined;
    }
    return parseStoredBranch(raw);
  } catch {
    return undefined;
  }
}

export function savePrivacySdkState(
  publicKey: string,
  branch: Record<string, unknown>,
): void {
  try {
    localStorage.setItem(storageKeyForWallet(publicKey), JSON.stringify(branch));
  } catch {
    return;
  }
}

export function clearPrivacySdkState(publicKey: string): void {
  try {
    localStorage.removeItem(storageKeyForWallet(publicKey));
  } catch {
    return;
  }
}
