import {
  resolvePoolApplicationId,
  type StellarTransactEnvironment,
} from "@arcane/privacy-sdk-stellar/transact";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { Networks } from "@stellar/stellar-sdk";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id.js";
import { readClientEnvironment } from "./read-client-environment.js";

const DEFAULT_SOROBAN_RPC = "https://soroban-testnet.stellar.org";

function readNetworkPassphraseAndRpc(): {
  networkPassphrase: string;
  sorobanRpcUrl: string;
} {
  const phrase = readClientEnvironment("VITE_STELLAR_NETWORK_PASSPHRASE");
  const soroban = readClientEnvironment("VITE_SOROBAN_RPC_URL");
  return {
    networkPassphrase: phrase?.trim() || Networks.TESTNET,
    sorobanRpcUrl: soroban?.trim() || DEFAULT_SOROBAN_RPC,
  };
}

function readRequiredEnvironment(name: string): string {
  const value = readClientEnvironment(name);
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

function readRequiredContractEnvironment(name: string): string {
  return normalizeSorobanContractId(readRequiredEnvironment(name));
}

function readRequiredApiBaseUrl(): string {
  return readRequiredEnvironment("VITE_API_BASE_URL").replace(/\/$/, "");
}

export function readPoolApplicationIdFromEnvironment(): string {
  return resolvePoolApplicationId(readClientEnvironment("VITE_APPLICATION_ID"));
}

export function readAuditPublicKeyHexFromEnvironment(): string {
  return readRequiredEnvironment("VITE_STELLAR_AUDIT_PUBLIC_KEY");
}

export function buildStellarTransactEnvironment(): StellarTransactEnvironment {
  const { networkPassphrase, sorobanRpcUrl } = readNetworkPassphraseAndRpc();
  return {
    network: {
      id: "stellar-testnet",
      rpcUrl: sorobanRpcUrl,
      networkPassphrase,
      poolContract: readRequiredContractEnvironment("VITE_POOL_CONTRACT"),
      registryContract: readRequiredContractEnvironment("VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT"),
      applicationId: readPoolApplicationIdFromEnvironment(),
    },
    kyt: {
      apiBaseUrl: readRequiredApiBaseUrl(),
      kytPassageRegistryContract: readRequiredContractEnvironment("VITE_KYT_PASSAGE_REGISTRY_CONTRACT"),
      registerPassageOnChain: false,
    },
    signTransaction: async (input) => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(input.xdr, {
        networkPassphrase: input.networkPassphrase,
        address: input.address,
      });
      return { signedTxXdr };
    },
  };
}
