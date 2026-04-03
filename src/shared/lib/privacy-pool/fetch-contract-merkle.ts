import { Buffer } from "buffer";
import { Client as PrivacyPoolContractClient } from "contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import {
  commitmentsBuffersToDecimal,
  getCachedMerkleState,
  setCachedMerkleState,
  type MerkleState,
} from "./merkle-cache";

const { sorobanRpcUrl: defaultSorobanRpcUrl, networkPassphrase: defaultPassphrase } =
  getDefaultStellarNetworkConfig();

export interface FetchContractMerkleResult {
  commitmentCount: number;
  commitments: string[];
  merkleRootHex: string;
}

async function createPoolClient(parameters: {
  contractId: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<InstanceType<typeof PrivacyPoolContractClient>> {
  const { contractId, walletPublicKey, networkPassphrase, sorobanRpcUrl } =
    parameters;
  return (await PrivacyPoolContractClient.from({
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
  })) as InstanceType<typeof PrivacyPoolContractClient>;
}

function normalizeCommitmentBuffers(rawBuffers: Buffer[]): Buffer[] {
  return rawBuffers.map((bufferRow) =>
    Buffer.isBuffer(bufferRow) ? bufferRow : Buffer.from(bufferRow),
  );
}

function mergeContractMerkleWithCache(parameters: {
  poolContractId: string;
  contractCommitments: string[];
  contractCount: number;
  merkleRootHex: string;
  cachedState: MerkleState | undefined;
}): { commitments: string[]; updatedAt: number } {
  const cachedCount = parameters.cachedState?.commitments.length ?? 0;
  const shouldPreferContract =
    parameters.contractCount > cachedCount ||
    !parameters.cachedState ||
    cachedCount === 0;
  if (shouldPreferContract) {
    setCachedMerkleState({
      contractId: parameters.poolContractId,
      commitments: parameters.contractCommitments,
      merkleRootHex: parameters.merkleRootHex,
    });
    return {
      commitments: parameters.contractCommitments,
      updatedAt: Date.now(),
    };
  }
  return {
    commitments: parameters.cachedState!.commitments,
    updatedAt: parameters.cachedState!.updatedAt,
  };
}

export async function fetchAndMergeMerkleState(parameters: {
  poolContractId: string;
  walletPublicKey: string;
  networkPassphrase?: string;
  sorobanRpcUrl?: string;
}): Promise<{ commitments: string[]; updatedAt: number }> {
  const passphrase = parameters.networkPassphrase ?? defaultPassphrase;
  const rpcUrl = parameters.sorobanRpcUrl ?? defaultSorobanRpcUrl;
  const client = await createPoolClient({
    contractId: parameters.poolContractId,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });

  const commitmentsRead = await client.get_commitments();
  const rawBuffers = commitmentsRead.result as Buffer[];
  const buffers = normalizeCommitmentBuffers(rawBuffers);
  const contractCommitments = commitmentsBuffersToDecimal(buffers);
  const contractCount = contractCommitments.length;

  const rootRead = await client.get_merkle_root();
  const merkleRootBuffer = rootRead.result as Buffer;
  const merkleRootHex = Buffer.from(merkleRootBuffer).toString("hex");

  const cachedState = getCachedMerkleState(parameters.poolContractId);
  return mergeContractMerkleWithCache({
    poolContractId: parameters.poolContractId,
    contractCommitments,
    contractCount,
    merkleRootHex,
    cachedState,
  });
}

export async function readLeafEphemeralHex(parameters: {
  poolContractId: string;
  walletPublicKey: string;
  leafIndex: number;
  networkPassphrase?: string;
  sorobanRpcUrl?: string;
}): Promise<{ xHex: string; yHex: string }> {
  const passphrase = parameters.networkPassphrase ?? defaultPassphrase;
  const rpcUrl = parameters.sorobanRpcUrl ?? defaultSorobanRpcUrl;
  const client = await createPoolClient({
    contractId: parameters.poolContractId,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });
  const read = await client.get_leaf_ephemeral({ leaf_index: parameters.leafIndex });
  const coords = read.result;
  if (!coords?.x || !coords?.y) {
    throw new Error("Missing leaf ephemeral key on contract");
  }
  return {
    xHex: Buffer.from(coords.x).toString("hex"),
    yHex: Buffer.from(coords.y).toString("hex"),
  };
}
