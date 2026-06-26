import type { OnboardingPayload } from "contract";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";
import { runTtlPreflight } from "./ttl-preflight";
import {
  approvalSignatureToBytes,
  requestKytPassageForPoolInteraction,
} from "./kyt-passage-inspect";
import type { KytApplicationIdHints } from "./privacy-pool-proof-types";

export interface SubmitSorobanConfidentialTransferInput {
  contractId: string;
  walletPublicKey: string;
  proofHex: string;
  publicHex: string;
  onboarding?: OnboardingPayload;
  applicationIdsPlaintext?: KytApplicationIdHints;
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
  const approval = await requestKytPassageForPoolInteraction({
    owner: input.walletPublicKey,
    poolContract: input.contractId,
    proofHex: input.proofHex,
    publicHex: input.publicHex,
    onboarding: input.onboarding,
    applicationIdsPlaintext: input.applicationIdsPlaintext,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });
  // NOTE: Keep KYT authorization in pool.transact so indexers can read one tx context.
  const assembledTransaction = await contractClient.transact({
    from: input.walletPublicKey,
    proof_bytes: Buffer.from(input.proofHex.replace(/^0x/i, ""), "hex"),
    pub_signals_bytes: Buffer.from(input.publicHex.replace(/^0x/i, ""), "hex"),
    onboarding: input.onboarding,
    kyt_authorization: {
      expiration_ledger: approval.expiresAtLedger,
      signature: approvalSignatureToBytes(approval.signature),
    },
  });
  await runTtlPreflight(assembledTransaction);
  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
