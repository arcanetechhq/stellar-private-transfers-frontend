import { readConnectedWalletAddress } from "./read-connected-wallet-address";
import { WalletAccountMismatchError } from "./wallet-account-mismatch-error";

export async function assertWalletSigningAddress(
  expectedAddress: string,
): Promise<void> {
  const expected = expectedAddress.trim();
  if (!expected) {
    throw new Error("Wallet not connected");
  }

  const active = await readConnectedWalletAddress();
  if (!active || active !== expected) {
    throw new WalletAccountMismatchError({
      expectedAddress: expected,
      activeAddress: active,
    });
  }
}
