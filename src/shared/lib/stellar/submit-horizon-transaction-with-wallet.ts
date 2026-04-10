import { TransactionBuilder, Horizon } from "@stellar/stellar-sdk";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";

export interface SubmitHorizonTransactionWithWalletInput {
  horizonUrl: string;
  networkPassphrase: string;
  publicKey: string;
  xdr: string;
}

export async function submitHorizonTransactionWithWallet(
  input: SubmitHorizonTransactionWithWalletInput,
): Promise<void> {
  const server = new Horizon.Server(input.horizonUrl);
  const { signedTxXdr } = await StellarWalletsKitSdk.signTransaction(input.xdr, {
    networkPassphrase: input.networkPassphrase,
    address: input.publicKey,
  });
  const transaction = TransactionBuilder.fromXDR(
    signedTxXdr,
    input.networkPassphrase,
  );
  await server.submitTransaction(transaction);
}
