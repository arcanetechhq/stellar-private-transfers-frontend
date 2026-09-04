import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import {
  listVisibleEscrowNotes,
  pendingEscrowClaimId,
  toPendingEscrowAssetClaim,
  type PendingEscrowAssetClaim,
} from "../lib/pending-escrow-asset-claims.js";
import { useEscrowClaimPreviews } from "./use-escrow-claim-previews.js";
import { useEscrowClaimedKeys } from "./use-escrow-claimed-keys.js";
import { useEscrowReceiveClick } from "./use-escrow-receive-click.js";

export function useClaimEscrowNotes(input: {
  notes: readonly EscrowIndexNote[];
  walletPublicKey: string | undefined;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  canClaim: boolean;
}): {
  pendingAssetClaims: PendingEscrowAssetClaim[];
  claimControls: {
    claimingId: string | undefined;
    canClaim: boolean;
    onClaim: (transactionId: string) => void;
    error?: string;
  };
} {
  const { t: translatePending } = useTranslation("pendingClaims");
  const { claimed, claimedKeys, bumpClaimed } = useEscrowClaimedKeys(
    input.walletPublicKey,
  );
  const fallbackAssetId = translatePending("unknownAsset");
  const previews = useEscrowClaimPreviews({
    notes: input.notes,
    claimedKeys,
    walletPublicKey: input.walletPublicKey,
    fallbackAssetId,
  });
  const pendingAssetClaims = useMemo(
    () =>
      listVisibleEscrowNotes({ notes: input.notes, claimedKeys }).map(
        (note) => {
          const preview = previews.get(pendingEscrowClaimId(note));
          return toPendingEscrowAssetClaim({
            note,
            assetId: preview?.assetId ?? fallbackAssetId,
            amountDisplay: preview?.amountDisplay ?? 0,
          });
        },
      ),
    [claimedKeys, fallbackAssetId, input.notes, previews],
  );
  const { claimingId, error, onClaim } = useEscrowReceiveClick({
    notes: input.notes,
    claimed,
    claimedKeys,
    walletPublicKey: input.walletPublicKey,
    canClaim: input.canClaim,
    ensureWalletPrivateAddress: input.ensureWalletPrivateAddress,
    ensureWalletScalar: input.ensureWalletScalar,
    bumpClaimed,
  });

  return {
    pendingAssetClaims,
    claimControls: {
      claimingId,
      canClaim: input.canClaim,
      onClaim,
      ...(error ? { error } : {}),
    },
  };
}
