const ZERO_BALANCE_ERROR_MARKERS = [
  "underfund",
  "insufficient",
  "not enough",
  "balance too low",
  "op_underfunded",
  "funding",
] as const;

function readErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

export function isZeroBalanceRegistrationError(error: unknown): boolean {
  const normalized = readErrorText(error).toLowerCase();
  return ZERO_BALANCE_ERROR_MARKERS.some((marker) =>
    normalized.includes(marker),
  );
}

export function logRegisterPrivateAddressError(error: unknown): void {
  if (isZeroBalanceRegistrationError(error)) {
    console.error(
      "Failed to create private address for zero-balance wallet:",
      error,
    );
    return;
  }
  console.error("Register private address failed");
}
