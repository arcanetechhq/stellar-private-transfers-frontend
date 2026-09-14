import {
  DEFAULT_ZK_CONFIG_NONCE,
  parseAuditPublicKeyFromEnvHex,
  resolvePoolApplicationId,
  type StellarTransactEnvironment,
} from "@arcanetech/privacy-sdk-stellar/transact";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { Networks } from "@stellar/stellar-sdk";
import { assertWalletSigningAddress } from "@/shared/lib/wallet/assert-wallet-signing-address";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id.js";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { readClientEnvironment } from "./read-client-environment.js";

const DEFAULT_SOROBAN_RPC = "https://soroban-testnet.stellar.org";
const ZERO_ZK_CONFIG_NONCE = 0n;

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

const DECIMAL_APPLICATION_ID = /^\d+$/u;

export function readPoolApplicationIdFromEnvironment(): string {
  const applicationId = resolvePoolApplicationId(
    readClientEnvironment("VITE_APPLICATION_ID"),
  );
  if (!DECIMAL_APPLICATION_ID.test(applicationId)) {
    throw new Error(
      "VITE_APPLICATION_ID must be association.audit_id (decimal Fr), not a UUID or foreignId",
    );
  }
  return applicationId;
}

export function readAuditPublicKeyHexFromEnvironment(): string {
  return readRequiredEnvironment("VITE_STELLAR_AUDIT_PUBLIC_KEY");
}

export function readZkConfigNonceFromEnvironment(): bigint | undefined {
  const raw = readClientEnvironment("VITE_ZK_CONFIG_NONCE")?.trim();
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = BigInt(raw);
    if (parsed < ZERO_ZK_CONFIG_NONCE) {
      throw new Error("VITE_ZK_CONFIG_NONCE must be a non-negative integer");
    }
    return parsed;
  } catch {
    throw new Error("VITE_ZK_CONFIG_NONCE must be a non-negative integer");
  }
}

export function resolveZkConfigNonceFromEnvironment(): bigint {
  return readZkConfigNonceFromEnvironment() ?? DEFAULT_ZK_CONFIG_NONCE;
}

export function readZkArtifactBaseUrlFromEnvironment(): string | undefined {
  const raw = readClientEnvironment("VITE_ZK_ARTIFACT_BASE_URL")?.trim();
  if (!raw) {
    return undefined;
  }
  let withoutSlash = raw;
  while (withoutSlash.endsWith("/")) {
    withoutSlash = withoutSlash.slice(0, -1);
  }
  return withoutSlash;
}

export function buildStellarTransactEnvironment(): StellarTransactEnvironment {
  const { networkPassphrase, sorobanRpcUrl } = readNetworkPassphraseAndRpc();
  const zkConfigNonce = readZkConfigNonceFromEnvironment();
  const zkArtifactBaseUrl = readZkArtifactBaseUrlFromEnvironment();
  return {
    network: {
      id: "stellar-testnet",
      rpcUrl: sorobanRpcUrl,
      networkPassphrase,
      poolContract: readRequiredContractEnvironment("VITE_POOL_CONTRACT"),
      registryContract: readRequiredContractEnvironment(
        "VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT",
      ),
      applicationId: readPoolApplicationIdFromEnvironment(),
    },
    ...(zkConfigNonce === undefined ? {} : { zkConfigNonce }),
    ...(zkArtifactBaseUrl === undefined ? {} : { zkArtifactBaseUrl }),
    auditPublicKey: parseAuditPublicKeyFromEnvHex(
      readAuditPublicKeyHexFromEnvironment(),
    ),
    kyt: {
      apiBaseUrl: getRequiredApiBaseUrl(),
      kytPassageRegistryContract: readRequiredContractEnvironment(
        "VITE_KYT_PASSAGE_REGISTRY_CONTRACT",
      ),
      registerPassageOnChain: false,
    },
    signTransaction: async (input) => {
      await assertWalletSigningAddress(input.address);
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(
        input.xdr,
        {
          networkPassphrase: input.networkPassphrase,
          address: input.address,
        },
      );
      return { signedTxXdr };
    },
  };
}
