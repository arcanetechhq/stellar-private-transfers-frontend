import {
  listEscrowIndexByTag,
  type EscrowIndexNote,
} from "@/entities/escrow-index";
import { mapWithConcurrency } from "./map-with-concurrency.js";

const TAG_FETCH_CONCURRENCY = 6;

function noteKey(note: EscrowIndexNote): string {
  return `${note.txId}:${note.seq}`;
}

export async function listEscrowNotesForTags(input: {
  transfersBaseUrl: string;
  tags: readonly string[];
  fetchImpl?: typeof fetch;
}): Promise<EscrowIndexNote[]> {
  const pages = await mapWithConcurrency({
    items: input.tags,
    concurrency: TAG_FETCH_CONCURRENCY,
    mapItem: (tag) =>
      listEscrowIndexByTag({
        transfersBaseUrl: input.transfersBaseUrl,
        tag,
        ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
      }),
  });
  const unique = new Map<string, EscrowIndexNote>();
  for (const note of pages.flat()) {
    unique.set(noteKey(note), note);
  }
  return [...unique.values()];
}
