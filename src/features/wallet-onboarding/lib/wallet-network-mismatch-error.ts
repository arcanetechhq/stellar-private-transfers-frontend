export class WalletNetworkMismatchError extends Error {
  readonly walletNetworkPassphrase: string;
  readonly expectedNetworkPassphrase: string;

  constructor(parameters: {
    walletNetworkPassphrase: string;
    expectedNetworkPassphrase: string;
  }) {
    super("Wallet network does not match the application network");
    this.name = "WalletNetworkMismatchError";
    this.walletNetworkPassphrase = parameters.walletNetworkPassphrase;
    this.expectedNetworkPassphrase = parameters.expectedNetworkPassphrase;
  }
}

export function isWalletNetworkMismatchError(
  error: unknown,
): error is WalletNetworkMismatchError {
  return error instanceof WalletNetworkMismatchError;
}
