interface AuditLegInput {
  value: number;
  precommitementHex: string;
  nullifierDecimal: string;
  tokenAddress: string;
}

export function buildAuditWithdrawLeg(input: AuditLegInput): Record<string, unknown> {
  return {
    value: input.value,
    precommitement: input.precommitementHex,
    nullifier: input.nullifierDecimal,
    asset: input.tokenAddress,
  };
}

export function buildAuditDepositLeg(
  receiver: string,
  input: AuditLegInput,
): Record<string, unknown> {
  return {
    receiver,
    ...buildAuditWithdrawLeg(input),
  };
}
