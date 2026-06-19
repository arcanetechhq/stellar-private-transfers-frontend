import { Client as RegistryContractClient } from "registry-contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

export type PrivateAddressRegistryClient = RegistryContractClient;

export function createRegistryContractClient(parameters: {
  contractId: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): PrivateAddressRegistryClient {
  const { contractId, walletPublicKey, networkPassphrase, sorobanRpcUrl } =
    parameters;
  return new RegistryContractClient({
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
