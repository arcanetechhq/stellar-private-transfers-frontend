import type { OnboardingPayload } from "contract";
import type { InspectKytPassageApproved } from "@auditable/privacy-pool-zk-sdk";
import {
  approvalSignatureToBytes,
} from "./kyt-passage-inspect";
import { runTtlPreflight } from "./ttl-preflight";

type PoolTransactResult = {
  signAndSend: () => Promise<{
    sendTransactionResponse?: {
      hash?: string;
    };
  }>;
};

type PoolTransactClient = {
  transact: (parameters: {
    from: string;
    proof_bytes: Buffer;
    pub_signals_bytes: Buffer;
    onboarding: OnboardingPayload | undefined;
    kyt_authorization: {
      expiration_ledger: number;
      signature: Buffer;
    };
  }) => Promise<PoolTransactResult>;
};

export async function submitPoolTransact(parameters: {
  contractClient: PoolTransactClient;
  from: string;
  proofHex: string;
  publicHex: string;
  onboarding?: OnboardingPayload;
  approval: InspectKytPassageApproved;
}): Promise<string> {
  const assembledTransaction = await parameters.contractClient.transact({
    from: parameters.from,
    proof_bytes: Buffer.from(parameters.proofHex.replace(/^0x/iu, ""), "hex"),
    pub_signals_bytes: Buffer.from(parameters.publicHex.replace(/^0x/iu, ""), "hex"),
    onboarding: parameters.onboarding,
    kyt_authorization: {
      expiration_ledger: parameters.approval.expiresAtLedger,
      signature: approvalSignatureToBytes(parameters.approval.signature),
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
