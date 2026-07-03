export function buildDepositTransferLink(recipientPublicKey: string): string {
  const trimmed = recipientPublicKey.trim();
  const path = `/create-transfer?recipient=${encodeURIComponent(trimmed)}`;
  return `${globalThis.location.origin}${path}`;
}
