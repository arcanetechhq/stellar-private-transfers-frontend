import { useEffect, useState } from "react";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { useGetAssetsQuery } from "@/entities/asset";
import { listVisibleEscrowNotes } from "../lib/pending-escrow-asset-claims.js";
import {
  previewVisibleEscrowNote,
  type EscrowClaimPreview,
} from "../lib/preview-visible-escrow-note.js";

export function useEscrowClaimPreviews(input: {
  notes: readonly EscrowIndexNote[];
  claimedKeys: ReadonlySet<string>;
  walletPublicKey: string | undefined;
  fallbackAssetId: string;
}): Map<string, EscrowClaimPreview> {
  const { data: catalog } = useGetAssetsQuery();
  const [previews, setPreviews] = useState<Map<string, EscrowClaimPreview>>(
    () => new Map(),
  );
  const { notes, claimedKeys, walletPublicKey, fallbackAssetId } = input;

  useEffect(() => {
    const owner = walletPublicKey?.trim();
    if (!owner) {
      setPreviews(new Map());
      return;
    }
    const visible = listVisibleEscrowNotes({ notes, claimedKeys });
    let cancelled = false;
    Promise.all(
      visible.map((note) =>
        previewVisibleEscrowNote({
          note,
          walletPublicKey: owner,
          catalog: catalog ?? [],
          fallbackAssetId,
        }),
      ),
    )
      .then((entries) => {
        if (!cancelled) {
          setPreviews(new Map(entries));
        }
      })
      .catch(() => {
        return;
      });
    return () => {
      cancelled = true;
    };
  }, [catalog, claimedKeys, fallbackAssetId, notes, walletPublicKey]);

  return previews;
}
