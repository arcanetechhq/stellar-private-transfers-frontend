export function toAuditNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} is too large for audit encoding`);
  }
  return Number(value);
}
