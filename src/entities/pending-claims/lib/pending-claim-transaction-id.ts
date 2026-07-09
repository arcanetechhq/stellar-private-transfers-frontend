const PENDING_CLAIM_TRANSACTION_ID_PREFIX = "pending-claim-";

export function getPendingClaimTransactionId(claimId: number): string {
  return `${PENDING_CLAIM_TRANSACTION_ID_PREFIX}${claimId}`;
}

export function parsePendingClaimTransactionId(
  transactionId: string,
): number | undefined {
  if (!transactionId.startsWith(PENDING_CLAIM_TRANSACTION_ID_PREFIX)) {
    return undefined;
  }
  const raw = transactionId.slice(PENDING_CLAIM_TRANSACTION_ID_PREFIX.length);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

export function isPendingClaimTransactionId(transactionId: string): boolean {
  return parsePendingClaimTransactionId(transactionId) !== undefined;
}
