export function normalizeCommitmentHex(
  hex: string | undefined,
): string | undefined {
  if (!hex?.trim()) return undefined;
  return hex.trim().replace(/^0x/iu, "").toLowerCase();
}
