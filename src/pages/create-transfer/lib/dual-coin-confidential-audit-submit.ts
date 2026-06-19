import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import type { OnboardingPayload } from "contract";
import type { CoinWithMetadata } from "@/entities/coin";
import {
  getAuditPublicKey,
  toAuditNumber,
} from "@/features/deposit";
import { prepareConfidentialTransferProofDual } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";
import {
  buildAuditDepositLeg,
  buildAuditWithdrawLeg,
} from "@/shared/lib/audit/build-audit-transaction-leg";
import { resolveAuditPrecommitementHex } from "@/shared/lib/audit/resolve-audit-precommitement-hex";

type PreparedDualProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProofDual>
>;

function buildDualAuditTransaction(parameters: {
  first: CoinWithMetadata;
  second: CoinWithMetadata;
  noteA: bigint;
  noteB: bigint;
  transferStroops: bigint;
  changeStroopsDual: bigint;
  recipientTrim: string;
  senderTrim: string;
  tokenContract: string;
  preparedDual: PreparedDualProof;
}): ITransaction {
  const base = {
    withdraw1: buildAuditWithdrawLeg({
      value: toAuditNumber(parameters.noteA, "Note value"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.first.precommitementHex,
        "withdraw1",
      ),
      nullifierDecimal: parameters.first.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
    withdraw2: buildAuditWithdrawLeg({
      value: toAuditNumber(parameters.noteB, "Note value"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.second.precommitementHex,
        "withdraw2",
      ),
      nullifierDecimal: parameters.second.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
    deposit1: buildAuditDepositLeg(parameters.recipientTrim, {
      value: toAuditNumber(parameters.transferStroops, "Transfer amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.preparedDual.recipientCoin.precommitementHex,
        "deposit1",
      ),
      nullifierDecimal: parameters.preparedDual.recipientCoin.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
  };
  if (!parameters.preparedDual.changeCoin) {
    return base as unknown as ITransaction;
  }
  return {
    ...base,
    deposit2: buildAuditDepositLeg(parameters.senderTrim, {
      value: toAuditNumber(parameters.changeStroopsDual, "Change amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.preparedDual.changeCoin.precommitementHex,
        "deposit2",
      ),
      nullifierDecimal: parameters.preparedDual.changeCoin.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
  } as unknown as ITransaction;
}

export async function sealEncryptAndSubmitDualCoinConfidentialTransfer(
  parameters: {
    preparedDual: PreparedDualProof;
    first: CoinWithMetadata;
    second: CoinWithMetadata;
    noteA: bigint;
    noteB: bigint;
    transferStroops: bigint;
    changeStroopsDual: bigint;
    recipientTrim: string;
    senderTrim: string;
    input: RunConfidentialTransferInput;
    poolContract: string;
    tokenContract: string;
    onboarding?: OnboardingPayload;
  },
): Promise<string> {
  const {
    preparedDual,
    first,
    second,
    noteA,
    noteB,
    transferStroops,
    changeStroopsDual,
    recipientTrim,
    senderTrim,
    input,
    poolContract,
    tokenContract,
  } = parameters;
  const auditTxDual = buildDualAuditTransaction({
    first,
    second,
    noteA,
    noteB,
    transferStroops,
    changeStroopsDual,
    recipientTrim,
    senderTrim,
    tokenContract,
    preparedDual,
  });
  const encodedDual = await sealAndEncryptTransaction(auditTxDual, getAuditPublicKey());
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: preparedDual.proof_hex,
    publicHex: preparedDual.public_hex,
    encoded: encodedDual,
    onboarding: parameters.onboarding,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
