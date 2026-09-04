import type { EscrowIndexNote } from "@/entities/escrow-index";
import {
  pendingEscrowClaimId,
  resolveClaimAssetId,
  type EscrowClaimAssetCatalogEntry,
} from "./pending-escrow-asset-claims.js";
import { previewEscrowNoteDisplay } from "./preview-escrow-note-display.js";

export type EscrowClaimPreview = {
  assetId: string;
  amountDisplay: number;
};

export async function previewVisibleEscrowNote(input: {
  note: EscrowIndexNote;
  walletPublicKey: string;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
  fallbackAssetId: string;
}): Promise<readonly [string, EscrowClaimPreview]> {
  const claimId = pendingEscrowClaimId(input.note);
  try {
    const preview = await previewEscrowNoteDisplay({
      note: input.note,
      walletPublicKey: input.walletPublicKey,
    });
    return [
      claimId,
      {
        assetId: resolveClaimAssetId({
          tokenAddress: preview.tokenAddress,
          catalog: input.catalog,
          fallback: input.fallbackAssetId,
        }),
        amountDisplay: preview.amountDisplay,
      },
    ];
  } catch {
    return [claimId, { assetId: input.fallbackAssetId, amountDisplay: 0 }];
  }
}
