import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment.js";
import { getPrivacyTransactEnvironment } from "./transact-context.js";

export function resolveTransactRuntime(input: {
  contractId: string;
  walletPublicKey: string;
  networkPassphrase?: string;
  sorobanRpcUrl?: string;
}) {
  const defaults = getDefaultStellarNetworkConfig();
  const passphrase = input.networkPassphrase ?? defaults.networkPassphrase;
  const rpcUrl = input.sorobanRpcUrl ?? defaults.sorobanRpcUrl;
  const transactEnvironment = getPrivacyTransactEnvironment();
  return { passphrase, rpcUrl, transactEnvironment };
}
