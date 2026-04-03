import { Buffer } from "buffer";
import { Client as PrivacyPoolContractClient } from "contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";

function hexToBuffer(hex: string): Buffer {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(clean, "hex");
}

export interface SubmitSorobanConfidentialTransferInput {
  contractId: string;
  walletPublicKey: string;
  proofHex: string;
  publicHex: string;
  encoded: Uint8Array;
  networkPassphrase?: string;
  sorobanRpcUrl?: string;
}

function resolveNetwork(input: SubmitSorobanConfidentialTransferInput): {
  passphrase: string;
  rpcUrl: string;
} {
  const defaults = getDefaultStellarNetworkConfig();
  return {
    passphrase: input.networkPassphrase ?? defaults.networkPassphrase,
    rpcUrl: input.sorobanRpcUrl ?? defaults.sorobanRpcUrl,
  };
}

export async function submitSorobanConfidentialTransfer(
  input: SubmitSorobanConfidentialTransferInput,
): Promise<string> {
  const { passphrase, rpcUrl } = resolveNetwork(input);
  const contractClient = (await PrivacyPoolContractClient.from({
    contractId: input.contractId,
    networkPassphrase: passphrase,
    rpcUrl,
    allowHttp: true,
    publicKey: input.walletPublicKey,
    signTransaction: (xdrInput, options) =>
      StellarWalletsKit.signTransaction(xdrInput, {
        networkPassphrase: options?.networkPassphrase ?? passphrase,
        address: options?.address ?? input.walletPublicKey,
      }),
  })) as InstanceType<typeof PrivacyPoolContractClient>;

  const assembledTransaction = await contractClient.transact({
    from: input.walletPublicKey,
    proof_bytes: hexToBuffer(input.proofHex),
    pub_signals_bytes: hexToBuffer(input.publicHex),
    encoded: Buffer.from(input.encoded),
  });

  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
