const STORAGE_KEY = "arcane-testnet-notice-ack-v1";

export function hasAcknowledgedTestnetNotice(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function acknowledgeTestnetNotice(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    return;
  }
}
