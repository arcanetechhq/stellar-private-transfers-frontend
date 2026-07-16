import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { WalletAccountMismatchError } from "./wallet-account-mismatch-error";

export async function assertWalletSigningAddress(
  expectedAddress: string,
): Promise<void> {
  const expected = expectedAddress.trim();
  if (!expected) {
    throw new Error("Wallet not connected");
  }

  const { address } = await StellarWalletsKit.fetchAddress();
  const active = address.trim();
  if (!active || active !== expected) {
    throw new WalletAccountMismatchError({
      expectedAddress: expected,
      activeAddress: active,
    });
  }
}
