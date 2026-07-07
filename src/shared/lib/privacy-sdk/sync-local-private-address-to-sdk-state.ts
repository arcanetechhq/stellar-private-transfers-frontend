import { tryGetPrivacySdkClient } from "./transact-context.js";

export async function syncLocalPrivateAddressToSdkState(input: {
  walletPublicKey: string;
  privateAddressStpl1: string;
  registered?: boolean;
}): Promise<boolean> {
  const client = tryGetPrivacySdkClient();
  const trimmedPublicKey = input.walletPublicKey.trim();
  const trimmedPrivateAddress = input.privateAddressStpl1.trim();
  if (!client || !trimmedPublicKey || !trimmedPrivateAddress) {
    return false;
  }
  await client.saveRegisteredPrivateAddress({
    address: trimmedPublicKey,
    privateAddress: trimmedPrivateAddress,
    registered: input.registered ?? false,
  });
  return true;
}
