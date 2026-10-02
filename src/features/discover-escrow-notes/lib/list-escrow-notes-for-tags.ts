import type { EscrowIndexNote } from "@/entities/escrow-index";
import { mapWithConcurrency } from "./map-with-concurrency.js";
import { createEscrowDataProvider } from "./create-private-data-providers.js";

const TAG_FETCH_CONCURRENCY = 6;

function noteKey(note: EscrowIndexNote): string {
  return `${note.txId}:${note.seq}`;
}

async function refuseEscrowListingAuthorization(): Promise<{
  signature: string;
  signerPublicKey: string;
}> {
  throw new Error("Escrow listing does not authorize.");
}

export async function listEscrowNotesForTags(input: {
  privateDataOrigin: string;
  tags: readonly string[];
  fetchImpl?: typeof fetch;
}): Promise<EscrowIndexNote[]> {
  const provider = createEscrowDataProvider({
    origin: input.privateDataOrigin,
    signMessage: refuseEscrowListingAuthorization,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  const pages = await mapWithConcurrency({
    items: input.tags,
    concurrency: TAG_FETCH_CONCURRENCY,
    mapItem: (tag) => provider.find({ blindedRecipientTag: tag }),
  });
  const unique = new Map<string, EscrowIndexNote>();
  for (const note of pages.flat()) {
    unique.set(noteKey(note), note);
  }
  return [...unique.values()];
}
