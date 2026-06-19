import { Client as PrivacyPoolContractClient } from "contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

export type PoolContractClient = PrivacyPoolContractClient;

export function createPoolContractClient(parameters: {
  contractId: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): PoolContractClient {
  const { contractId, walletPublicKey, networkPassphrase, sorobanRpcUrl } =
    parameters;
  return new PrivacyPoolContractClient({
    contractId,
    networkPassphrase,
    rpcUrl: sorobanRpcUrl,
    allowHttp: true,
    publicKey: walletPublicKey,
    signTransaction: (xdrInput, options) =>
      StellarWalletsKit.signTransaction(xdrInput, {
        networkPassphrase: options?.networkPassphrase ?? networkPassphrase,
        address: options?.address ?? walletPublicKey,
      }),
  });
}
