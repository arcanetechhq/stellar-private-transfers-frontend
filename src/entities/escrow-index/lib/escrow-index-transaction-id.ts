const ESCROW_INDEX_TRANSACTION_ID_PREFIX = "escrow-index-";

export function getEscrowIndexTransactionId(input: {
  txId: string;
  seq: number;
}): string {
  return `${ESCROW_INDEX_TRANSACTION_ID_PREFIX}${input.txId}-${input.seq}`;
}

export function isEscrowIndexTransactionId(transactionId: string): boolean {
  return transactionId.startsWith(ESCROW_INDEX_TRANSACTION_ID_PREFIX);
}
