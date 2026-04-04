import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import type { CoinWithMetadata } from "@/entities/coin";
import { getAuditPublicKey, decimalFieldToBytes } from "@/features/deposit/lib/audit-encoding";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import { toAuditNumber } from "@/features/deposit/lib/to-audit-number";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";

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
  } = parameters;
  const auditPublicKey = getAuditPublicKey();
  const auditTx: ITransaction = {
    withdraw1: {
      value: toAuditNumber(noteStroops, "Note value"),
      secret: decimalFieldToBytes(only.coin.secret),
      nullifier: decimalFieldToBytes(only.coin.nullifier),
    },
    deposit1: {
      receiver: recipientTrim,
      value: toAuditNumber(transferStroops, "Transfer amount"),
      secret: decimalFieldToBytes(prepared.recipientCoin.coin.secret),
      nullifier: decimalFieldToBytes(prepared.recipientCoin.coin.nullifier),
    },
  };
  if (prepared.changeCoin) {
    const changeStroops = noteStroops - transferStroops;
    auditTx.deposit2 = {
      receiver: senderTrim,
      value: toAuditNumber(changeStroops, "Change amount"),
      secret: decimalFieldToBytes(prepared.changeCoin.coin.secret),
      nullifier: decimalFieldToBytes(prepared.changeCoin.coin.nullifier),
    };
  }
  const encoded = await sealAndEncryptTransaction(auditTx, auditPublicKey);
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: prepared.proof_hex,
    publicHex: prepared.public_hex,
    encoded,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
