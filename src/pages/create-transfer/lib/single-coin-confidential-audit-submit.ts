import type { OnboardingPayload } from "contract";
import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import type { CoinWithMetadata } from "@/entities/coin";
import {
  getAuditPublicKey,
  toAuditNumber,
} from "@/features/deposit";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";
import {
  buildAuditDepositLeg,
  buildAuditWithdrawLeg,
} from "@/shared/lib/audit/build-audit-transaction-leg";
import { resolveAuditPrecommitementHex } from "@/shared/lib/audit/resolve-audit-precommitement-hex";

type PreparedSingleProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProof>
>;

export async function sealEncryptAndSubmitSingleCoinConfidentialTransfer(
  parameters: {
    prepared: PreparedSingleProof;
    only: CoinWithMetadata;
    noteStroops: bigint;
    transferStroops: bigint;
    recipientTrim: string;
    senderTrim: string;
    input: RunConfidentialTransferInput;
    poolContract: string;
    tokenContract: string;
    onboarding?: OnboardingPayload;
  },
): Promise<string> {
  const {
    prepared,
    only,
    noteStroops,
    transferStroops,
    recipientTrim,
    senderTrim,
    input,
    poolContract,
    tokenContract,
  } = parameters;
  const auditPublicKey = getAuditPublicKey();
  const auditTx = {
    withdraw1: buildAuditWithdrawLeg({
      value: toAuditNumber(noteStroops, "Note value"),
      precommitementHex: resolveAuditPrecommitementHex(
        only.precommitementHex,
        "withdraw1",
      ),
      nullifierDecimal: only.coin.nullifier,
      tokenAddress: tokenContract,
    }),
    deposit1: buildAuditDepositLeg(recipientTrim, {
      value: toAuditNumber(transferStroops, "Transfer amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        prepared.recipientCoin.precommitementHex,
        "deposit1",
      ),
      nullifierDecimal: prepared.recipientCoin.coin.nullifier,
      tokenAddress: tokenContract,
    }),
  } as unknown as ITransaction;
  if (prepared.changeCoin) {
    const changeStroops = noteStroops - transferStroops;
    (auditTx as Record<string, unknown>)["deposit2"] = buildAuditDepositLeg(
      senderTrim,
      {
        value: toAuditNumber(changeStroops, "Change amount"),
        precommitementHex: resolveAuditPrecommitementHex(
          prepared.changeCoin.precommitementHex,
          "deposit2",
        ),
        nullifierDecimal: prepared.changeCoin.coin.nullifier,
        tokenAddress: tokenContract,
      },
    );
  }
  const encoded = await sealAndEncryptTransaction(auditTx, auditPublicKey);
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: prepared.proof_hex,
    publicHex: prepared.public_hex,
    encoded,
    onboarding: parameters.onboarding,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
