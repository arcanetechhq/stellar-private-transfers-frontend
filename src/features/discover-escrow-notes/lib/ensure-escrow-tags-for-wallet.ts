import { readPrivateDataOriginFromEnvironment } from "@/shared/stellar/read-private-data-origin.js";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { ensureIssuedEscrowTags } from "./discover-escrow-notes.js";
import { signEscrowTagChallenge } from "./sign-escrow-tag-challenge.js";

export async function ensureEscrowTagsForWallet(
  stellarAddress: string | undefined,
): Promise<void> {
  const address = stellarAddress?.trim();
  if (!address) {
    return;
  }
  const privateDataOrigin = readPrivateDataOriginFromEnvironment();
  if (privateDataOrigin === undefined) {
    return;
  }
  await ensureIssuedEscrowTags({
    privateDataOrigin,
    transfersBaseUrl: getRequiredApiBaseUrl(),
    stellarAddress: address,
    signChallenge: (message) =>
      signEscrowTagChallenge({ message, address }),
  });
}
