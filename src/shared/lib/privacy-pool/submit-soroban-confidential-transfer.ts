import { Buffer } from "buffer";
import type { OnboardingPayload } from "contract";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";
import { runTtlPreflight } from "./ttl-preflight";

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
  onboarding?: OnboardingPayload;
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
  const contractClient = createPoolContractClient({
    contractId: input.contractId,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });

  const assembledTransaction = await contractClient.transact_with_onboarding({
    from: input.walletPublicKey,
    proof_bytes: hexToBuffer(input.proofHex),
    pub_signals_bytes: hexToBuffer(input.publicHex),
    encoded: Buffer.from(input.encoded),
    onboarding: input.onboarding,
  });

  await runTtlPreflight(assembledTransaction);
  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
