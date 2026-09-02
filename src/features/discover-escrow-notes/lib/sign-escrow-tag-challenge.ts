import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

export async function signEscrowTagChallenge(input: {
  message: string;
  address: string;
}): Promise<{ signature: string; signerPublicKey: string }> {
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(input.message, {
    address: input.address,
    networkPassphrase,
  });
  return {
    signature: signedMessage,
    signerPublicKey: input.address,
  };
}
