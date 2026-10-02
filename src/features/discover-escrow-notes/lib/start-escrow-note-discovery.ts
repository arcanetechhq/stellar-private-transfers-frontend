import type { Dispatch, SetStateAction } from "react";
import {
  listEscrowIndexByTag,
  type EscrowIndexNote,
} from "@/entities/escrow-index";
import { readPrivateDataOriginFromEnvironment } from "@/shared/stellar/read-private-data-origin.js";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import { ensureIssuedEscrowTags } from "./discover-escrow-notes.js";
import type { IssuedBlindedRecipientTag } from "./issued-blinded-recipient-tag.js";
import { localStorageEscrowTagStore } from "./persist-escrow-tags.js";
import { startEscrowEpochPolling } from "./poll-escrow-epochs.js";
import { replaceEscrowNotesForTag } from "./replace-escrow-notes-for-tag.js";
import { signEscrowTagChallenge } from "./sign-escrow-tag-challenge.js";

function stopNothing(): void {
  return;
}

type DiscoveryInput = {
  stellarAddress: string;
  setNotes: Dispatch<SetStateAction<EscrowIndexNote[]>>;
  setLoading: (loading: boolean) => void;
};

function applyTagNotes(input: {
  setNotes: DiscoveryInput["setNotes"];
  tag: string;
  incoming: readonly EscrowIndexNote[];
}): void {
  input.setNotes((current) =>
    replaceEscrowNotesForTag({
      current,
      tag: input.tag,
      incoming: input.incoming,
    }),
  );
}

async function loadIssuedTags(
  stellarAddress: string,
): Promise<IssuedBlindedRecipientTag[]> {
  const privateDataOrigin = readPrivateDataOriginFromEnvironment();
  return ensureIssuedEscrowTags({
    transfersBaseUrl: getRequiredApiBaseUrl(),
    stellarAddress,
    signChallenge: (message) =>
      signEscrowTagChallenge({ message, address: stellarAddress }),
    ...(privateDataOrigin === undefined ? {} : { privateDataOrigin }),
  });
}

function beginEpochPolling(
  input: DiscoveryInput,
  tags: IssuedBlindedRecipientTag[],
): () => void {
  return startEscrowEpochPolling({
    tags,
    onInitialSettled: () => {
      input.setLoading(false);
    },
    onTagNotes: (tag, incoming) => {
      applyTagNotes({ setNotes: input.setNotes, tag, incoming });
    },
    listTag: (entry) =>
      listEscrowIndexByTag({
        transfersBaseUrl: getRequiredApiBaseUrl(),
        tag: entry.tag,
      }),
  });
}

export function startEscrowNoteDiscovery(input: DiscoveryInput): () => void {
  let stopped = false;
  let stopPolling = stopNothing;
  const hasCachedTags = Boolean(
    localStorageEscrowTagStore.read(input.stellarAddress)?.length,
  );
  if (!hasCachedTags) {
    input.setLoading(true);
  }
  void loadIssuedTags(input.stellarAddress)
    .then((tags) => {
      if (stopped) {
        return;
      }
      if (tags.length === 0) {
        input.setNotes([]);
        input.setLoading(false);
        return;
      }
      stopPolling = beginEpochPolling(input, tags);
    })
    .catch(() => {
      if (stopped) {
        return;
      }
      input.setNotes([]);
      input.setLoading(false);
    });
  return () => {
    stopped = true;
    stopPolling();
  };
}
