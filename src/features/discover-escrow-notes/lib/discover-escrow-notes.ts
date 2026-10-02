import type { EscrowIndexNote } from "@/entities/escrow-index";
import { normalizePrivateDataOrigin } from "@/shared/stellar/normalize-private-data-origin.js";
import type { IssuedBlindedRecipientTag } from "./issued-blinded-recipient-tag.js";
import {
  issueEscrowTagsViaProvider,
  type SignEscrowTagChallenge,
} from "./issue-escrow-tags-via-provider.js";
import { listEscrowNotesForTags } from "./list-escrow-notes-for-tags.js";
import {
  localStorageEscrowTagStore,
  type EscrowTagStore,
} from "./persist-escrow-tags.js";

export type { SignEscrowTagChallenge };

export type DiscoverEscrowNotesInput = {
  privateDataOrigin?: string;
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
  privateDataOrigin: string;
  stellarAddress: string;
  signChallenge: SignEscrowTagChallenge;
  fetchImpl?: typeof fetch;
  tagStore: EscrowTagStore;
}): Promise<IssuedBlindedRecipientTag[]> {
  const issued = await issueEscrowTagsViaProvider({
    privateDataOrigin: input.privateDataOrigin,
    stellarAddress: input.stellarAddress,
    signChallenge: input.signChallenge,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  persistIssuedTags({
    tagStore: input.tagStore,
    walletAddress: input.stellarAddress,
    signerAddress: issued.signerPublicKey,
    tags: issued.tags,
  });
  return issued.tags;
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
  const privateDataOrigin = normalizePrivateDataOrigin(input.privateDataOrigin);
  if (!privateDataOrigin) {
    return [];
  }
  const pending = issueInFlight.get(stellarAddress);
  if (pending) {
    return pending;
  }
  const run = issueAndStoreTags({
    privateDataOrigin,
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
