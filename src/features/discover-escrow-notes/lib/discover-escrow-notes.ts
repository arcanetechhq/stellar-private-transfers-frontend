import { resolveStorageApiOrigin } from "@/shared/stellar/resolve-storage-api-origin.js";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { issueEscrowTags } from "./issue-escrow-tags.js";
import { listEscrowNotesForTags } from "./list-escrow-notes-for-tags.js";
import { requestEscrowTagChallenge } from "./request-escrow-tag-challenge.js";

export type SignEscrowTagChallenge = (message: string) => Promise<{
  signature: string;
  signerPublicKey: string;
}>;

export type DiscoverEscrowNotesInput = {
  storageOrigin?: string;
  transfersBaseUrl: string;
  stellarAddress: string;
  signChallenge: SignEscrowTagChallenge;
  fetchImpl?: typeof fetch;
};

export async function discoverEscrowNotes(
  input: DiscoverEscrowNotesInput,
): Promise<EscrowIndexNote[]> {
  const storageOrigin = resolveStorageApiOrigin(input.storageOrigin);
  if (storageOrigin === undefined) {
    return [];
  }
  const challenge = await requestEscrowTagChallenge({
    storageOrigin,
    stellarAddress: input.stellarAddress,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  const proof = await input.signChallenge(challenge.message);
  const tags = await issueEscrowTags({
    storageOrigin,
    challenge,
    signature: proof.signature,
    signerPublicKey: proof.signerPublicKey,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  return listEscrowNotesForTags({
    transfersBaseUrl: input.transfersBaseUrl,
    tags: tags.map((entry) => entry.tag),
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
}
