let restoreInFlight = false;

export function runWalletScopedRestore(restore: () => void): void {
  restoreInFlight = true;
  try {
    restore();
  } finally {
    restoreInFlight = false;
  }
}

export function isWalletScopedRestoreInFlight(): boolean {
  return restoreInFlight;
}
