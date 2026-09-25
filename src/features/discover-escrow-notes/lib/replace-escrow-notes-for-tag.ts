import {
  areEscrowNotesEqual,
  type EscrowIndexNote,
} from "@/entities/escrow-index";

function noteKey(note: EscrowIndexNote): string {
  return `${note.blindedRecipientTag}:${note.txId}:${note.seq}`;
}

function sortedNotes(notes: readonly EscrowIndexNote[]): EscrowIndexNote[] {
  return notes.toSorted((left, right) =>
    noteKey(left).localeCompare(noteKey(right)),
  );
}

export function replaceEscrowNotesForTag(input: {
  current: EscrowIndexNote[];
  tag: string;
  incoming: readonly EscrowIndexNote[];
}): EscrowIndexNote[] {
  const next = [
    ...input.current.filter((note) => note.blindedRecipientTag !== input.tag),
    ...input.incoming,
  ];
  if (areEscrowNotesEqual(sortedNotes(input.current), sortedNotes(next))) {
    return input.current;
  }
  return next;
}
