export function resolveEscrowTagSignerPublicKey(input: {
  accountAddress: string;
  signerAddress?: string;
}): string {
  const signerAddress = input.signerAddress?.trim();
  if (signerAddress) {
    return signerAddress;
  }
  return input.accountAddress;
}
