export const WALLET_ACCOUNT_MISMATCH_SENTINEL = "Wallet account changed";

export class WalletAccountMismatchError extends Error {
  readonly expectedAddress: string;
  readonly activeAddress: string;

  constructor(parameters: { expectedAddress: string; activeAddress: string }) {
    super(WALLET_ACCOUNT_MISMATCH_SENTINEL);
    this.name = "WalletAccountMismatchError";
    this.expectedAddress = parameters.expectedAddress;
    this.activeAddress = parameters.activeAddress;
  }
}

export function isWalletAccountMismatchError(
  error: unknown,
): error is WalletAccountMismatchError {
  return error instanceof WalletAccountMismatchError;
}

export function isWalletAccountMismatchMessage(message: string): boolean {
  return message.trim() === WALLET_ACCOUNT_MISMATCH_SENTINEL;
}
