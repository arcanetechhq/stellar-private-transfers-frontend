import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { resolveEscrowTagSignerPublicKey } from "./resolve-escrow-tag-signer.js";

export async function signEscrowTagChallenge(input: {
  message: string;
  address: string;
}): Promise<{ signature: string; signerPublicKey: string }> {
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const signed = await StellarWalletsKit.signMessage(input.message, {
    address: input.address,
    networkPassphrase,
  });
  const signerAddress = signed.signerAddress?.trim();
  return {
    signature: signed.signedMessage,
    signerPublicKey: resolveEscrowTagSignerPublicKey({
      accountAddress: input.address,
      ...(signerAddress ? { signerAddress } : {}),
    }),
  };
}
