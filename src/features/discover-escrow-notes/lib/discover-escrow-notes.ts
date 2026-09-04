import { resolveStorageApiOrigin } from "@/shared/stellar/resolve-storage-api-origin.js";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { issueEscrowTags } from "./issue-escrow-tags.js";
import type { IssuedBlindedRecipientTag } from "./issue-escrow-tags.js";
import { listEscrowNotesForTags } from "./list-escrow-notes-for-tags.js";
import { requestEscrowTagChallenge } from "./request-escrow-tag-challenge.js";
import {
  localStorageEscrowTagStore,
  type EscrowTagStore,
} from "./persist-escrow-tags.js";

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
  tagStore?: EscrowTagStore;
};

const issueInFlight = new Map<string, Promise<IssuedBlindedRecipientTag[]>>();

export function resetEscrowTagIssueInFlightForTests(): void {
  issueInFlight.clear();
}

function tagStoreFromInput(input: DiscoverEscrowNotesInput): EscrowTagStore {
  return input.tagStore ?? localStorageEscrowTagStore;
}

async function issueAndStoreTags(input: {
  storageOrigin: string;
  stellarAddress: string;
  signChallenge: SignEscrowTagChallenge;
  fetchImpl?: typeof fetch;
  tagStore: EscrowTagStore;
}): Promise<IssuedBlindedRecipientTag[]> {
  const challenge = await requestEscrowTagChallenge({
    storageOrigin: input.storageOrigin,
    stellarAddress: input.stellarAddress,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  const proof = await input.signChallenge(challenge.message);
  const tags = await issueEscrowTags({
    storageOrigin: input.storageOrigin,
    challenge,
    signature: proof.signature,
    signerPublicKey: proof.signerPublicKey,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  persistIssuedTags({
    tagStore: input.tagStore,
    walletAddress: input.stellarAddress,
    signerAddress: proof.signerPublicKey,
    tags,
  });
  return tags;
}

function persistIssuedTags(input: {
  tagStore: EscrowTagStore;
  walletAddress: string;
  signerAddress: string;
  tags: readonly IssuedBlindedRecipientTag[];
}): void {
  const walletAddress = input.walletAddress.trim();
  const signerAddress = input.signerAddress.trim() || walletAddress;
  input.tagStore.write({ signerAddress, tags: input.tags });
  if (walletAddress.length > 0 && walletAddress !== signerAddress) {
    input.tagStore.write({ signerAddress: walletAddress, tags: input.tags });
  }
}

export async function ensureIssuedEscrowTags(
  input: DiscoverEscrowNotesInput,
): Promise<IssuedBlindedRecipientTag[]> {
  const stellarAddress = input.stellarAddress.trim();
  const store = tagStoreFromInput(input);
  const cached = store.read(stellarAddress);
  if (cached && cached.length > 0) {
    return cached;
  }
  const storageOrigin = resolveStorageApiOrigin(input.storageOrigin);
  if (storageOrigin === undefined) {
    return [];
  }
  const pending = issueInFlight.get(stellarAddress);
  if (pending) {
    return pending;
  }
  const run = issueAndStoreTags({
    storageOrigin,
    stellarAddress,
    signChallenge: input.signChallenge,
    tagStore: store,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  issueInFlight.set(stellarAddress, run);
  try {
    return await run;
  } finally {
    issueInFlight.delete(stellarAddress);
  }
}

export async function discoverEscrowNotes(
  input: DiscoverEscrowNotesInput,
): Promise<EscrowIndexNote[]> {
  const tags = await ensureIssuedEscrowTags(input);
  if (tags.length === 0) {
    return [];
  }
  return listEscrowNotesForTags({
    transfersBaseUrl: input.transfersBaseUrl,
    tags: tags.map((entry) => entry.tag),
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
}
