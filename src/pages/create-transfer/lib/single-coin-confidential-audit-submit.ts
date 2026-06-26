import type { OnboardingPayload } from "contract";
import type { CoinWithMetadata } from "@/entities/coin";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";

type PreparedSingleProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProof>
>;

export async function sealEncryptAndSubmitSingleCoinConfidentialTransfer(
  parameters: {
    prepared: PreparedSingleProof;
    only: CoinWithMetadata;
    input: RunConfidentialTransferInput;
    poolContract: string;
    onboarding?: OnboardingPayload;
  },
): Promise<string> {
  const {
    prepared,
    input,
    poolContract,
  } = parameters;
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: prepared.proof_hex,
    publicHex: prepared.public_hex,
    onboarding: parameters.onboarding,
    applicationIdsPlaintext: prepared.applicationIdsPlaintext,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
