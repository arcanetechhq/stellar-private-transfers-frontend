import type { OnboardingPayload } from "contract";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";
import { requestKytPassageForPoolInteraction } from "./kyt-passage-inspect";
import type { KytApplicationIdHints } from "./privacy-pool-proof-types";
import { submitPoolTransact } from "./submit-pool-transact";

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
  return submitPoolTransact({
    contractClient,
    onboarding: input.onboarding,
    from: input.walletPublicKey,
    proofHex: input.proofHex,
    publicHex: input.publicHex,
    approval,
  });
}
