import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { assertWalletSigningAddress } from "@/shared/lib/wallet/assert-wallet-signing-address";

type AuthEntrySigner = {
  signAuthEntry: (
    authEntryXdr: string,
    options: { address: string; networkPassphrase: string },
  ) => Promise<{ signedAuthEntry: string } | string>;
  signTransaction?: never;
};

function readSignedAuthEntry(
  signed: { signedAuthEntry: string } | string,
): string {
  if (typeof signed === "string") {
    return signed;
  }
  return signed.signedAuthEntry;
}

export async function signEscrowAuthEntry(input: {
  authEntryXdr: string;
  address: string;
}): Promise<string> {
  await assertWalletSigningAddress(input.address);
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const signer = StellarWalletsKit as unknown as AuthEntrySigner;
  if (typeof signer.signAuthEntry !== "function") {
    throw new TypeError("Wallet cannot sign a Soroban authorization entry.");
  }
  const signed = await signer.signAuthEntry(input.authEntryXdr, {
    address: input.address,
    networkPassphrase,
  });
  return readSignedAuthEntry(signed);
}
