const PRECOMMITEMENT_HEX_LENGTH = 64;
const PRECOMMITEMENT_HEX_PATTERN = /^[0-9a-f]{64}$/u;

export function resolveAuditPrecommitementHex(
  precommitementHex: string | undefined,
  context: string,
): string {
  const normalized = precommitementHex?.trim().toLowerCase();
  if (!normalized) {
    throw new Error(`Missing precommitement hex for ${context}`);
  }
  if (
    normalized.length !== PRECOMMITEMENT_HEX_LENGTH ||
    !PRECOMMITEMENT_HEX_PATTERN.test(normalized)
  ) {
    throw new Error(`Invalid precommitement hex for ${context}`);
  }
  return normalized;
}
