import type { OnboardingPayload } from "contract";
import { prepareConfidentialTransferProofDual } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";

type PreparedDualProof = Awaited<ReturnType<typeof prepareConfidentialTransferProofDual>>;

export async function sealEncryptAndSubmitDualCoinConfidentialTransfer(
  parameters: {
    preparedDual: PreparedDualProof;
    input: RunConfidentialTransferInput;
    poolContract: string;
    onboarding?: OnboardingPayload;
  },
): Promise<string> {
  const {
    preparedDual,
    input,
    poolContract,
  } = parameters;
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: preparedDual.proof_hex,
    publicHex: preparedDual.public_hex,
    onboarding: parameters.onboarding,
    applicationIdsPlaintext: preparedDual.applicationIdsPlaintext,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
