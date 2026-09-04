import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { readStorageApiOriginFromEnvironment } from "@/shared/stellar/read-storage-api-origin.js";
import { ensureIssuedEscrowTags } from "./discover-escrow-notes.js";
import { signEscrowTagChallenge } from "./sign-escrow-tag-challenge.js";

export async function ensureEscrowTagsForWallet(
  stellarAddress: string | undefined,
): Promise<void> {
  const address = stellarAddress?.trim();
  if (!address) {
    return;
  }
  const storageOrigin = readStorageApiOriginFromEnvironment();
  if (storageOrigin === undefined) {
    return;
  }
  await ensureIssuedEscrowTags({
    storageOrigin,
    transfersBaseUrl: getRequiredApiBaseUrl(),
    stellarAddress: address,
    signChallenge: (message) =>
      signEscrowTagChallenge({ message, address }),
  });
}
