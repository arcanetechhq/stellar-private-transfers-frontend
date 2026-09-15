import { errorToMessage } from "@/shared/lib/wallet/sign-message-errors";

const ZERO_BALANCE_ERROR_MARKERS = [
  "underfund",
  "insufficient",
  "not enough",
  "balance too low",
  "op_underfunded",
  "funding",
] as const;

function readErrorText(error: unknown): string {
  return errorToMessage(error);
}

export function isZeroBalanceRegistrationError(error: unknown): boolean {
  const normalized = readErrorText(error).toLowerCase();
  return ZERO_BALANCE_ERROR_MARKERS.some((marker) =>
    normalized.includes(marker),
  );
}

export function formatRegisterPrivateAddressError(error: unknown): string {
  return readErrorText(error).trim();
}

export function logRegisterPrivateAddressError(error: unknown): void {
  if (isZeroBalanceRegistrationError(error)) {
    console.error(
      "Failed to create private address for zero-balance wallet:",
      error,
    );
    return;
  }
  console.error("Register private address failed", error);
}
