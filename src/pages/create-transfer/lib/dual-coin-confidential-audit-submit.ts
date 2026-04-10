import { sealAndEncryptTransaction, type ITransaction } from "@auditable/stellar-audit";
import type { CoinWithMetadata } from "@/entities/coin";
import {
  getAuditPublicKey,
  decimalFieldToBytes,
  toAuditNumber,
} from "@/features/deposit";
import { prepareConfidentialTransferProofDual } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";

type PreparedDualProof = Awaited<
  ReturnType<typeof prepareConfidentialTransferProofDual>
>;

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
  } = parameters;
  const recipientCoinDual = preparedDual.recipientCoin;
  const changeCoinDual = preparedDual.changeCoin;
  const auditPublicKeyDual = getAuditPublicKey();
  const auditTxDual: ITransaction = {
    withdraw1: {
      value: toAuditNumber(noteA, "Note value"),
      secret: decimalFieldToBytes(first.coin.secret),
      nullifier: decimalFieldToBytes(first.coin.nullifier),
    },
    withdraw2: {
      value: toAuditNumber(noteB, "Note value"),
      secret: decimalFieldToBytes(second.coin.secret),
      nullifier: decimalFieldToBytes(second.coin.nullifier),
    },
    deposit1: {
      receiver: recipientTrim,
      value: toAuditNumber(transferStroops, "Transfer amount"),
      secret: decimalFieldToBytes(recipientCoinDual.coin.secret),
      nullifier: decimalFieldToBytes(recipientCoinDual.coin.nullifier),
    },
  };
  if (changeCoinDual) {
    auditTxDual.deposit2 = {
      receiver: senderTrim,
      value: toAuditNumber(changeStroopsDual, "Change amount"),
      secret: decimalFieldToBytes(changeCoinDual.coin.secret),
      nullifier: decimalFieldToBytes(changeCoinDual.coin.nullifier),
    };
  }
  const encodedDual = await sealAndEncryptTransaction(
    auditTxDual,
    auditPublicKeyDual,
  );
  return submitSorobanConfidentialTransfer({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    proofHex: preparedDual.proof_hex,
    publicHex: preparedDual.public_hex,
    encoded: encodedDual,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
}
