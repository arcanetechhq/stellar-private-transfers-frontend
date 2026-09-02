import { Networks } from "@stellar/stellar-sdk";
import { normalizeSorobanContractId } from "./normalize-soroban-contract-id";

const DEFAULT_HORIZON = "https://horizon-testnet.stellar.org";
const DEFAULT_SOROBAN_RPC = "https://soroban-testnet.stellar.org";

export interface StellarNetworkEnvironmentConfig {
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
}

export function getDefaultStellarNetworkConfig(): StellarNetworkEnvironmentConfig {
  const phrase = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as
    | string
    | undefined;
  const horizonUrl = import.meta.env.VITE_HORIZON_URL as string | undefined;
  const soroban = import.meta.env.VITE_SOROBAN_RPC_URL as string | undefined;
  return {
    networkPassphrase: phrase?.trim() || Networks.TESTNET,
    horizonUrl: horizonUrl?.trim() || DEFAULT_HORIZON,
    sorobanRpcUrl: soroban?.trim() || DEFAULT_SOROBAN_RPC,
  };
}

export function getRequiredPrivacyPoolContractId(): string {
  const raw = (import.meta.env.VITE_POOL_CONTRACT as string | undefined)?.trim();
  if (!raw) {
    throw new Error("Missing VITE_POOL_CONTRACT environment variable");
  }
  return normalizeSorobanContractId(raw);
}

export function getSpendScalarDomain(): {
  networkPassphrase: string;
  poolContract: string;
  registryContract: string;
} {
  return {
    networkPassphrase: getDefaultStellarNetworkConfig().networkPassphrase,
    poolContract: getRequiredPrivacyPoolContractId(),
    registryContract: getRequiredPrivateAddressRegistryContractId(),
  };
}

export function getRequiredPrivateAddressRegistryContractId(): string {
  const raw = (
    import.meta.env.VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT as string | undefined
  )?.trim();
  if (!raw) {
    throw new Error(
      "Missing VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT environment variable",
    );
  }
  return normalizeSorobanContractId(raw);
}

export function getRequiredKytPassageRegistryContractId(): string {
  const raw = (
    import.meta.env.VITE_KYT_PASSAGE_REGISTRY_CONTRACT as string | undefined
  )?.trim();
  if (!raw) {
    throw new Error("Missing VITE_KYT_PASSAGE_REGISTRY_CONTRACT environment variable");
  }
  return normalizeSorobanContractId(raw);
}

export function getRequiredApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    throw new Error("Missing VITE_API_BASE_URL environment variable");
  }
  return raw.replace(/\/$/u, "");
}
